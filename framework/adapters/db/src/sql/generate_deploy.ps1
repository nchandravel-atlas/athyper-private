<# ============================================================================
   Athyper — Combined Deploy Script Generator
   ============================================================================
   Generates 000_combined_deploy.sql by concatenating all migration and seed
   files in FK-dependency-resolved order.

   Usage:  pwsh -File generate_deploy.ps1
   ============================================================================ #>

$ErrorActionPreference = 'Stop'
$scriptDir = $PSScriptRoot

# ---------------------------------------------------------------------------
# Ordered file list (FK dependency-resolved, NOT numeric filename order)
# ---------------------------------------------------------------------------
$steps = @(
    # --- Bootstrap ---
    @{ file = '00_bootstrap/001_create_schemas.sql';             label = 'Schemas' }
    @{ file = '00_bootstrap/002_extensions.sql';                 label = 'Extensions' }

    # --- Core runtime (must be first — everything references core.tenant) ---
    @{ file = '20_core/010_core_runtime_tables.sql';             label = 'core.tenant + runtime tables' }
    @{ file = '20_core/015_alter_tenant_for_iam.sql';            label = 'Alter core.tenant for multi-realm IAM' }

    # --- Ref DDL (all ref tables including ref.label) ---
    @{ file = '30_ref/010_ref_master_tables.sql';                label = 'Reference data DDL (all ref tables)' }

    # --- Ref seed data (ordered by FK dependencies) ---
    @{ file = '30_ref/020_ref_seed_countries.sql';               label = 'Seed: ISO 3166-1 countries' }
    @{ file = '30_ref/021_ref_seed_subdivisions.sql';            label = 'Seed: ISO 3166-2 subdivisions' }
    @{ file = '30_ref/030_ref_seed_currencies.sql';              label = 'Seed: ISO 4217 currencies' }
    @{ file = '30_ref/040_ref_seed_languages.sql';               label = 'Seed: ISO 639-1 languages' }
    @{ file = '30_ref/050_ref_seed_locales.sql';                 label = 'Seed: BCP 47 locales' }
    @{ file = '30_ref/060_ref_seed_timezones.sql';               label = 'Seed: IANA timezones' }
    @{ file = '30_ref/070_ref_seed_uom.sql';                     label = 'Seed: UN/ECE Rec 20 units of measure' }
    @{ file = '30_ref/080_ref_seed_commodity.sql';               label = 'Seed: Commodity codes (UNSPSC + HS)' }
    @{ file = '30_ref/090_ref_seed_industry.sql';                label = 'Seed: Industry codes (ISIC + NAICS)' }

    # --- Ref label translations (depend on ref.locale seeds) ---
    @{ file = '30_ref/095_ref_seed_labels_ar.sql';               label = 'Seed: Arabic (ar) translations' }
    @{ file = '30_ref/096_ref_seed_labels_ms.sql';               label = 'Seed: Malay (ms) translations' }
    @{ file = '30_ref/097_ref_seed_labels_ta.sql';               label = 'Seed: Tamil (ta) translations' }
    @{ file = '30_ref/098_ref_seed_labels_hi.sql';               label = 'Seed: Hindi (hi) translations' }
    @{ file = '30_ref/099_ref_seed_labels_fr.sql';               label = 'Seed: French (fr) translations' }
    @{ file = '30_ref/100_ref_seed_labels_de.sql';               label = 'Seed: German (de) translations' }

    # --- Core permission model (needed by meta policy FK) ---
    @{ file = '20_core/042_permission_action_model.sql';         label = 'Permission action model (operation, persona, module)' }

    # --- Meta schema ---
    @{ file = '10_meta/010_meta_core_tables.sql';                label = 'Meta entity registry' }
    @{ file = '10_meta/020_meta_policy_tables.sql';              label = 'Meta policy tables' }
    @{ file = '10_meta/030_meta_workflow_tables.sql';             label = 'Meta workflow tables' }
    @{ file = '10_meta/040_meta_overlay_tables.sql';             label = 'Meta overlay tables' }

    # --- Core IAM + extensions ---
    @{ file = '20_core/020_core_iam_tables.sql';                 label = 'IAM (principal, group, role, address, etc.)' }
    @{ file = '20_core/030_core_workflow_runtime.sql';           label = 'Workflow runtime' }
    @{ file = '20_core/041_field_security.sql';                  label = 'Field security' }
    @{ file = '20_core/043_mfa_tables.sql';                      label = 'MFA tables' }
    @{ file = '20_core/044_tenant_iam_profile.sql';              label = 'Tenant IAM profile' }
    @{ file = '20_core/045_tenant_profile_update.sql';           label = 'Workspace + feature catalog + tenant feature subscriptions' }
    @{ file = '20_core/046_address_link.sql';                    label = 'Address link (polymorphic)' }
    @{ file = '20_core/047_tenant_locale_policy.sql';            label = 'Tenant locale policy' }

    # --- MDM ---
    @{ file = '40_mdm/010_mdm_master_tables.sql';                label = 'MDM master tables' }

    # --- UI ---
    @{ file = '50_ui/010_ui_dashboard_tables.sql';               label = 'UI dashboard tables' }

    # --- Seed data (operations, personas, modules, workspaces) ---
    @{ file = '90_seed/910_seed_operations.sql';                 label = 'Seed: operations' }
    @{ file = '90_seed/911_seed_personas.sql';                   label = 'Seed: personas + capability matrix' }
    @{ file = '90_seed/912_seed_modules.sql';                    label = 'Seed: modules' }
    @{ file = '90_seed/913_seed_workspaces.sql';                 label = 'Seed: workspaces + module linkage' }
    @{ file = '90_seed/920_seed_default_deny_policy.sql';        label = 'Seed: default deny policy' }
    @{ file = '90_seed/930_seed_platform_admin_allow.sql';       label = 'Seed: platform admin allow' }
    @{ file = '90_seed/940_refresh_compiled_policies.sql';       label = 'Seed: refresh compiled policies' }
)

$totalSteps = $steps.Count
$outFile = Join-Path $scriptDir '000_combined_deploy.sql'

# ---------------------------------------------------------------------------
# Build header
# ---------------------------------------------------------------------------
$header = @"
/* ============================================================================
   Athyper -- Combined Deployment Script
   ============================================================================
   AUTO-GENERATED -- Do not edit manually.
   Re-generate with:  pwsh -File generate_deploy.ps1

   This file concatenates ALL SQL migration and seed files in FK dependency-
   resolved order (NOT numeric file-naming order) so that every CREATE TABLE,
   ALTER TABLE, and INSERT runs without violating foreign-key constraints.

   Execution order ($totalSteps steps):
"@

$stepNum = 1
foreach ($s in $steps) {
    $paddedNum = $stepNum.ToString().PadLeft(2)
    $paddedFile = $s.file.PadRight(52)
    $header += "`n     $paddedNum.  $paddedFile-- $($s.label)"
    $stepNum++
}

$header += @"

   ============================================================================ */

BEGIN;

"@

# ---------------------------------------------------------------------------
# Concatenate each file
# ---------------------------------------------------------------------------
$body = ''
$stepNum = 1
foreach ($s in $steps) {
    $filePath = Join-Path $scriptDir $s.file
    if (-not (Test-Path $filePath)) {
        Write-Warning "MISSING: $($s.file) -- skipping"
        $stepNum++
        continue
    }

    $content = Get-Content $filePath -Raw -Encoding UTF8

    $body += @"
-- ============================================================================
-- STEP $stepNum of ${totalSteps}: $($s.file)
-- $($s.label)
-- ============================================================================

$content
-- END (Step $stepNum)

"@
    $stepNum++
}

# ---------------------------------------------------------------------------
# Write output
# ---------------------------------------------------------------------------
$footer = @"
COMMIT;

-- ============================================================================
-- Deployment complete ($totalSteps steps executed)
-- ============================================================================
"@

$output = $header + $body + $footer
[System.IO.File]::WriteAllText($outFile, $output, [System.Text.Encoding]::UTF8)

Write-Host "Generated $outFile ($totalSteps steps)" -ForegroundColor Green
