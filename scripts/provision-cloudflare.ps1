# =============================================================================
# summit-mvp — one-shot Cloudflare provisioning
# =============================================================================
# Creates:
#   - 2 Turnstile sites (dev + prod)
#   - 2 Workers KV namespaces (TOKEN_SEEN, RATE_LIMIT)
# Updates workers/turnstile-verify/wrangler.toml with the real KV namespace IDs.
# Prints:
#   - Turnstile site keys (public — paste into CF Pages env vars)
#   - Turnstile SECRET keys (secret — pipe into `wrangler secret put`)
#   - KV namespace IDs (now also written into wrangler.toml)
#
# What this does NOT do:
#   - Create the Pages project (git-connected; dashboard only; 4 clicks).
#   - Deploy the Worker (you'll `wrangler deploy --env dev` after).
#
# The API token you paste lives only in this script's process memory.
#
# Usage:   pwsh ./scripts/provision-cloudflare.ps1
# Needs:   Cloudflare API Token with these permissions:
#          - Account:Turnstile:Edit
#          - Account:Workers KV Storage:Edit
#          Create at https://dash.cloudflare.com/profile/api-tokens
#            -> Create Token -> Custom Token
# =============================================================================

[CmdletBinding()]
param(
  [string]$ProjectName = "taj-website"
)

$ErrorActionPreference = "Stop"

function Read-Secret($prompt) {
  $sec = Read-Host $prompt -AsSecureString
  return [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
  )
}

function Invoke-CF {
  param([string]$Method = "GET", [string]$Path, $Body)
  $uri = "https://api.cloudflare.com/client/v4$Path"
  $args = @{ Method = $Method; Uri = $uri; Headers = $script:headers }
  if ($Body) { $args["Body"] = ($Body | ConvertTo-Json -Depth 10) }
  $resp = Invoke-RestMethod @args
  if (-not $resp.success) {
    $errs = ($resp.errors | ForEach-Object { "$($_.code): $($_.message)" }) -join "; "
    throw "Cloudflare API error: $errs"
  }
  return $resp.result
}

# ---- 1. API token ----------------------------------------------------------
Write-Host ""
Write-Host "Get a Cloudflare API Token at: https://dash.cloudflare.com/profile/api-tokens"
Write-Host "Click 'Create Token' -> 'Custom Token' and grant:"
Write-Host "  - Account:Turnstile:Edit"
Write-Host "  - Account:Workers KV Storage:Edit"
Write-Host "Name it 'summit-provisioning' and revoke after this script runs."
Write-Host ""
$token = Read-Secret "Cloudflare API Token (input hidden)"
$script:headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type"  = "application/json"
}

# ---- 2. Verify token + pick account ---------------------------------------
Write-Host ""
Write-Host "Verifying token..."
try {
  $verify = Invoke-CF -Path "/user/tokens/verify"
  Write-Host "  token OK — $($verify.status)"
} catch { throw "Token verify failed: $_" }

Write-Host "Fetching accounts..."
$accounts = Invoke-CF -Path "/accounts"
if (-not $accounts -or $accounts.Count -eq 0) { throw "Token sees no accounts." }

for ($i = 0; $i -lt $accounts.Count; $i++) {
  Write-Host ("  [{0}] {1}  (id: {2})" -f $i, $accounts[$i].name, $accounts[$i].id)
}
$accIdx = [int](Read-Host "Pick account index")
$aid    = $accounts[$accIdx].id

# ---- 3. Create Turnstile sites --------------------------------------------
function New-TurnstileSite($name, $domains) {
  Write-Host "Creating Turnstile site '$name'..."
  $body = @{
    name         = $name
    domains      = $domains
    mode         = "managed"
    region       = "world"
  }
  return Invoke-CF -Method POST -Path "/accounts/$aid/challenges/widgets" -Body $body
}

$prodDomain = "$ProjectName.pages.dev"
$devDomain  = "develop.$ProjectName.pages.dev"

$tsDev  = New-TurnstileSite "summit-dev"  @($devDomain, "*.$ProjectName.pages.dev")
Write-Host ("  dev  sitekey={0}" -f $tsDev.sitekey)

$tsProd = New-TurnstileSite "summit-prod" @($prodDomain)
Write-Host ("  prod sitekey={0}" -f $tsProd.sitekey)

# Fetch the secrets (separate endpoint).
function Get-TurnstileSecret($siteId) {
  $r = Invoke-CF -Path "/accounts/$aid/challenges/widgets/$siteId"
  return $r.secret
}
$tsDevSecret  = Get-TurnstileSecret $tsDev.sitekey
$tsProdSecret = Get-TurnstileSecret $tsProd.sitekey

# ---- 4. Create KV namespaces (one pair per env) ---------------------------
function New-KVNamespace($name) {
  Write-Host "Creating KV namespace '$name'..."
  $body = @{ title = $name }
  return Invoke-CF -Method POST -Path "/accounts/$aid/storage/kv/namespaces" -Body $body
}

$kvTokenSeenDev  = New-KVNamespace "summit-token-seen-dev"
$kvTokenSeenProd = New-KVNamespace "summit-token-seen-prod"
$kvRateDev       = New-KVNamespace "summit-rate-limit-dev"
$kvRateProd      = New-KVNamespace "summit-rate-limit-prod"

Write-Host "  dev  TOKEN_SEEN  id=$($kvTokenSeenDev.id)"
Write-Host "  prod TOKEN_SEEN  id=$($kvTokenSeenProd.id)"
Write-Host "  dev  RATE_LIMIT  id=$($kvRateDev.id)"
Write-Host "  prod RATE_LIMIT  id=$($kvRateProd.id)"

# ---- 5. Patch wrangler.toml -----------------------------------------------
$wranglerPath = Join-Path $PSScriptRoot "..\workers\turnstile-verify\wrangler.toml"
if (-not (Test-Path $wranglerPath)) {
  Write-Host "WARN: wrangler.toml not at $wranglerPath — skipping patch."
} else {
  $toml = Get-Content $wranglerPath -Raw

  $devBlock = @"

[[env.dev.kv_namespaces]]
binding = "TOKEN_SEEN"
id      = "$($kvTokenSeenDev.id)"

[[env.dev.kv_namespaces]]
binding = "RATE_LIMIT"
id      = "$($kvRateDev.id)"
"@

  $prodBlock = @"

[[env.production.kv_namespaces]]
binding = "TOKEN_SEEN"
id      = "$($kvTokenSeenProd.id)"

[[env.production.kv_namespaces]]
binding = "RATE_LIMIT"
id      = "$($kvRateProd.id)"
"@

  # Append only if not already present (idempotent).
  if ($toml -notmatch 'env\.dev\.kv_namespaces') {
    $toml = $toml.TrimEnd() + $devBlock + $prodBlock + "`n"
    Set-Content -Path $wranglerPath -Value $toml -Encoding utf8 -NoNewline
    Write-Host "  wrangler.toml patched with KV namespace IDs."
  } else {
    Write-Host "  wrangler.toml already has kv_namespaces — skipped (edit manually if needed)."
  }
}

# ---- 6. Output -------------------------------------------------------------
Write-Host ""
Write-Host "============================================================================"
Write-Host "  PASTE INTO CLOUDFLARE PAGES env vars (Pages > Settings > Env variables)"
Write-Host "============================================================================"
Write-Host ""
Write-Host "  PREVIEW (dev):"
Write-Host ("    NEXT_PUBLIC_TURNSTILE_SITE_KEY = {0}" -f $tsDev.sitekey)
Write-Host ""
Write-Host "  PRODUCTION:"
Write-Host ("    NEXT_PUBLIC_TURNSTILE_SITE_KEY = {0}" -f $tsProd.sitekey)
Write-Host ""
Write-Host "============================================================================"
Write-Host "  RUN THESE NOW to inject the Turnstile SECRETS into the Worker:"
Write-Host "============================================================================"
Write-Host ""
Write-Host "  cd workers/turnstile-verify"
Write-Host ""
Write-Host "  # dev"
Write-Host ("  '{0}' | wrangler secret put TURNSTILE_SECRET_KEY --env dev" -f $tsDevSecret)
Write-Host ""
Write-Host "  # prod"
Write-Host ("  '{0}' | wrangler secret put TURNSTILE_SECRET_KEY --env production" -f $tsProdSecret)
Write-Host ""
Write-Host "  # Also set the IP_HASH_SALT (fresh random, both envs):"
Write-Host '  wrangler secret put IP_HASH_SALT --env dev           # paste openssl rand -hex 32 output'
Write-Host '  wrangler secret put IP_HASH_SALT --env production    # same, DIFFERENT value'
Write-Host ""
Write-Host "============================================================================"
Write-Host "  Then:  wrangler deploy --env dev && wrangler deploy --env production"
Write-Host "============================================================================"
Write-Host ""
Write-Host "  NEXT: revoke this API token at"
Write-Host "        https://dash.cloudflare.com/profile/api-tokens"
Write-Host ""
