# =============================================================================
# summit-mvp — publish ToS + Privacy Policy to Supabase
# =============================================================================
# Reads docs/legal/terms-of-service.md + docs/legal/privacy-policy.md, pulls
# current substitution values from src/config/site.config.ts, and inserts into
# the legal_texts table on both dev + prod Supabase projects via the
# Management API. Postgres computes text_hash so the trigger validation
# passes by construction.
#
# Run this whenever Taj:
#   - updates the legal text (bump the Version: date in the .md file first)
#   - updates site.config.ts with real company name / email domains
#
# PAT lives only in this script's process memory. Revoke after use.
#
# Usage:   pwsh ./scripts/publish-legal-texts.ps1
# Needs:   Supabase PAT at https://supabase.com/dashboard/account/tokens
# =============================================================================

$ErrorActionPreference = "Stop"

function Read-Secret($prompt) {
  $sec = Read-Host $prompt -AsSecureString
  return [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
  )
}

$repo = Split-Path -Parent $PSScriptRoot
$tosPath     = Join-Path $repo "docs/legal/terms-of-service.md"
$privacyPath = Join-Path $repo "docs/legal/privacy-policy.md"
$configPath  = Join-Path $repo "src/config/site.config.ts"

if (-not (Test-Path $tosPath))     { throw "Missing: $tosPath" }
if (-not (Test-Path $privacyPath)) { throw "Missing: $privacyPath" }
if (-not (Test-Path $configPath))  { throw "Missing: $configPath" }

# Extract substitution values from site.config.ts (regex, lightweight).
$cfg = Get-Content $configPath -Raw
function Grab($pattern) {
  $m = [regex]::Match($cfg, $pattern)
  if (-not $m.Success) { throw "Could not parse '$pattern' from site.config.ts" }
  return $m.Groups[1].Value
}
$company      = Grab 'legalEntity:\s*\{\s*(?:[^\{]*?)name:\s*"([^"]+)"'
$companyShort = Grab 'shortName:\s*"([^"]+)"'
$siteUrl      = Grab '\n\s*url:\s*"([^"]+)"'
$emailSupport = Grab 'support:\s*"([^"]+)"'
$emailLegal   = Grab 'legal:\s*"([^"]+)"'
$emailPrivacy = Grab 'privacy:\s*"([^"]+)"'

Write-Host "Substitutions from site.config.ts:"
Write-Host "  COMPANY       = $company"
Write-Host "  COMPANY_SHORT = $companyShort"
Write-Host "  SITE_URL      = $siteUrl"
Write-Host "  EMAIL_SUPPORT = $emailSupport"
Write-Host "  EMAIL_LEGAL   = $emailLegal"
Write-Host "  EMAIL_PRIVACY = $emailPrivacy"
Write-Host ""

# Default version = today ISO date; override by first line "Version:" in the .md.
function Parse-Version($mdText) {
  $m = [regex]::Match($mdText, '(?m)^\*\*Version:\*\*\s+(.+?)\s*$')
  if ($m.Success) { return $m.Groups[1].Value.Trim() }
  return (Get-Date -Format "yyyy-MM-dd")
}

$tosRaw     = Get-Content $tosPath     -Raw
$privacyRaw = Get-Content $privacyPath -Raw
$tosVersion     = Parse-Version $tosRaw
$privacyVersion = Parse-Version $privacyRaw

Write-Host "Publishing ToS version: $tosVersion"
Write-Host "Publishing Privacy version: $privacyVersion"
Write-Host ""

$pat = Read-Secret "Supabase PAT (input hidden)"
$headers = @{ "Authorization" = "Bearer $pat"; "Content-Type" = "application/json" }

Write-Host "Fetching projects..."
$projects = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects" -Headers $headers
$dev  = $projects | Where-Object { $_.name -eq "summit-dev"  } | Select-Object -First 1
$prod = $projects | Where-Object { $_.name -eq "summit-prod" } | Select-Object -First 1
if (-not $dev)  { throw "summit-dev project not found" }
if (-not $prod) { throw "summit-prod project not found" }
Write-Host "  dev=$($dev.id)  prod=$($prod.id)"

# Build + submit each insert. Uses dollar-quoted strings so single quotes +
# dollar signs in the markdown are safe. The tag $doc_legal$ must not appear
# in the markdown; verify this with a quick grep below.
if ($tosRaw -match '\$doc_legal\$'     ) { throw "ToS text contains '`$doc_legal`$' — pick a different quote tag" }
if ($privacyRaw -match '\$doc_legal\$' ) { throw "Privacy text contains '`$doc_legal`$' — pick a different quote tag" }

function Publish($projRef, $projLabel, $kind, $version, $rawMd) {
  Write-Host ""
  Write-Host "[$projLabel] Flipping prior '$kind' is_current -> false..."
  $flip = @{ query = "update public.legal_texts set is_current = false where kind = '$kind' and is_current;" } | ConvertTo-Json
  Invoke-RestMethod -Method Post `
    -Uri "https://api.supabase.com/v1/projects/$projRef/database/query" `
    -Headers $headers -Body $flip | Out-Null

  Write-Host "[$projLabel] Inserting new '$kind' v$version..."
  $sql = @"
with raw as (
  select `$doc_legal`$$rawMd`$doc_legal`$::text as src
), subst as (
  select replace(replace(replace(replace(replace(replace(src,
    '{{COMPANY}}',       '$company'),
    '{{COMPANY_SHORT}}', '$companyShort'),
    '{{SITE_URL}}',      '$siteUrl'),
    '{{EMAIL_SUPPORT}}', '$emailSupport'),
    '{{EMAIL_LEGAL}}',   '$emailLegal'),
    '{{EMAIL_PRIVACY}}', '$emailPrivacy') as final_text
  from raw
)
insert into public.legal_texts (kind, version, full_text, text_hash, effective_at, is_current)
select '$kind', '$version', final_text,
       encode(extensions.digest(final_text, 'sha256'), 'hex'),
       now(),
       true
from subst
returning id, kind, version, substring(text_hash, 1, 16) as hash_prefix;
"@
  $body = @{ query = $sql } | ConvertTo-Json -Depth 5
  $r = Invoke-RestMethod -Method Post `
    -Uri "https://api.supabase.com/v1/projects/$projRef/database/query" `
    -Headers $headers -Body $body
  Write-Host "  -> $($r | ConvertTo-Json -Compress)"
}

Publish $dev.id  "dev"  "tos"     $tosVersion     $tosRaw
Publish $dev.id  "dev"  "privacy" $privacyVersion $privacyRaw
Publish $prod.id "prod" "tos"     $tosVersion     $tosRaw
Publish $prod.id "prod" "privacy" $privacyVersion $privacyRaw

Write-Host ""
Write-Host "============================================================================"
Write-Host "  Published both docs to dev + prod. Revoke the PAT now."
Write-Host "  https://supabase.com/dashboard/account/tokens"
Write-Host "============================================================================"
