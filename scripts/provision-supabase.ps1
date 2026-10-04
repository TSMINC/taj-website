# =============================================================================
# summit-mvp — one-shot Supabase provisioning
# =============================================================================
# Creates two Supabase projects (summit-dev, summit-prod), applies
# supabase/schema.sql to each, and prints the env block to paste into
# Cloudflare Pages env vars.
#
# The PAT you paste at the prompt lives only in this script's process memory.
# Nothing is written to disk by this script — no PAT, no db password cache.
#
# Usage:   pwsh ./scripts/provision-supabase.ps1
# Needs:   PAT from https://supabase.com/dashboard/account/tokens
# =============================================================================

$ErrorActionPreference = "Stop"

function Read-Secret($prompt) {
  $sec = Read-Host $prompt -AsSecureString
  return [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
  )
}

# ---- 1. PAT ----------------------------------------------------------------
Write-Host ""
Write-Host "Get a Supabase PAT at: https://supabase.com/dashboard/account/tokens"
Write-Host "Name it 'summit-provisioning' and revoke it after this script finishes."
$pat = Read-Secret "Supabase PAT (input hidden)"
$headers = @{ "Authorization" = "Bearer $pat"; "Content-Type" = "application/json" }

# ---- 2. Pick org -----------------------------------------------------------
Write-Host ""
Write-Host "Fetching your Supabase organizations..."
$orgs = Invoke-RestMethod -Uri "https://api.supabase.com/v1/organizations" -Headers $headers
if (-not $orgs -or $orgs.Count -eq 0) { throw "No organizations on this account." }

for ($i = 0; $i -lt $orgs.Count; $i++) {
  Write-Host ("  [{0}] {1}  (id: {2})" -f $i, $orgs[$i].name, $orgs[$i].id)
}
$orgIdx = [int](Read-Host "Pick org index")
$orgId  = $orgs[$orgIdx].id

# ---- 3. Pick region --------------------------------------------------------
$regions = @(
  @{ k = "us-west-1";    label = "US West 1 (N. California)" }
  @{ k = "us-east-1";    label = "US East 1 (N. Virginia)" }
  @{ k = "us-east-2";    label = "US East 2 (Ohio)" }
  @{ k = "eu-west-1";    label = "EU West 1 (Ireland)" }
)
Write-Host ""
Write-Host "Pick region (closest to you):"
for ($i = 0; $i -lt $regions.Count; $i++) {
  Write-Host ("  [{0}] {1}" -f $i, $regions[$i].label)
}
$regionIdx = [int](Read-Host "Index")
$region    = $regions[$regionIdx].k

# ---- 4. Generate strong DB passwords (shown ONCE at the end) ---------------
Add-Type -AssemblyName System.Web
$pwDev  = [System.Web.Security.Membership]::GeneratePassword(40, 10)
$pwProd = [System.Web.Security.Membership]::GeneratePassword(40, 10)

# ---- 5. Create projects ----------------------------------------------------
function New-Project($name, $pw) {
  $body = @{
    organization_id = $orgId
    name            = $name
    region          = $region
    db_pass         = $pw
    plan            = "free"
  } | ConvertTo-Json
  return Invoke-RestMethod -Method Post `
    -Uri "https://api.supabase.com/v1/projects" `
    -Headers $headers -Body $body
}

Write-Host ""
Write-Host "Creating summit-dev..."
$dev  = New-Project "summit-dev"  $pwDev
Write-Host ("  ref: {0}  status: {1}" -f $dev.id, $dev.status)

Write-Host "Creating summit-prod..."
$prod = New-Project "summit-prod" $pwProd
Write-Host ("  ref: {0}  status: {1}" -f $prod.id, $prod.status)

# ---- 6. Wait for projects to be queryable ----------------------------------
function Wait-Ready($ref, $label) {
  $deadline = (Get-Date).AddMinutes(5)
  while ((Get-Date) -lt $deadline) {
    try {
      $p = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$ref" -Headers $headers
      if ($p.status -eq "ACTIVE_HEALTHY") { return }
      Write-Host ("  {0}: {1}..." -f $label, $p.status)
    } catch { }
    Start-Sleep -Seconds 15
  }
  throw "$label did not become ACTIVE_HEALTHY in 5 minutes."
}
Write-Host ""
Write-Host "Waiting for projects to be ready (typically 60-120s each)..."
Wait-Ready $dev.id  "dev"
Wait-Ready $prod.id "prod"

# ---- 7. Fetch anon keys ----------------------------------------------------
function Get-AnonKey($ref) {
  $keys = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$ref/api-keys" -Headers $headers
  return ($keys | Where-Object { $_.name -eq "anon" }).api_key
}
$devAnon  = Get-AnonKey $dev.id
$prodAnon = Get-AnonKey $prod.id

# ---- 8. Apply schema.sql ---------------------------------------------------
$schemaPath = Join-Path $PSScriptRoot "..\supabase\schema.sql"
if (-not (Test-Path $schemaPath)) { throw "schema.sql not found at $schemaPath" }
$schemaSql = Get-Content $schemaPath -Raw

function Apply-Schema($ref, $label) {
  Write-Host "Applying schema to $label..."
  $body = @{ query = $schemaSql } | ConvertTo-Json
  try {
    Invoke-RestMethod -Method Post `
      -Uri "https://api.supabase.com/v1/projects/$ref/database/query" `
      -Headers $headers -Body $body | Out-Null
    Write-Host "  schema applied."
  } catch {
    Write-Host "  WARN: schema apply failed for $label — run manually via Supabase SQL editor."
    Write-Host "        reason: $($_.Exception.Message)"
  }
}
Apply-Schema $dev.id  "summit-dev"
Apply-Schema $prod.id "summit-prod"

# ---- 9. Print paste-ready env block + DB passwords -------------------------
Write-Host ""
Write-Host "============================================================================"
Write-Host "  PASTE THESE INTO CLOUDFLARE PAGES env vars (Settings > Environment)"
Write-Host "============================================================================"
Write-Host ""
Write-Host "  PREVIEW (dev):"
Write-Host ("    NEXT_PUBLIC_SUPABASE_URL      = https://{0}.supabase.co" -f $dev.id)
Write-Host ("    NEXT_PUBLIC_SUPABASE_ANON_KEY = {0}" -f $devAnon)
Write-Host ""
Write-Host "  PRODUCTION:"
Write-Host ("    NEXT_PUBLIC_SUPABASE_URL      = https://{0}.supabase.co" -f $prod.id)
Write-Host ("    NEXT_PUBLIC_SUPABASE_ANON_KEY = {0}" -f $prodAnon)
Write-Host ""
Write-Host "============================================================================"
Write-Host "  SAVE THESE SOMEWHERE SAFE NOW (password manager). Supabase will NOT"
Write-Host "  show them again. If lost, reset in Dashboard > Settings > Database."
Write-Host "============================================================================"
Write-Host ""
Write-Host ("  summit-dev  DB password:  {0}" -f $pwDev)
Write-Host ("  summit-prod DB password:  {0}" -f $pwProd)
Write-Host ""
Write-Host "============================================================================"
Write-Host "  NEXT: revoke your PAT at https://supabase.com/dashboard/account/tokens"
Write-Host "        (The 'summit-provisioning' token has done its job.)"
Write-Host "============================================================================"
