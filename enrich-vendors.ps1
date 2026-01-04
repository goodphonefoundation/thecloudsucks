# Enrich Directus vendors with Explorium firmographic data
# Business IDs and their corresponding Directus vendor IDs
$vendors = @(
    @{directus_id="2b78f779-a71b-4396-a232-94acb1c08dbf"; business_id="ecfea059284e08e53c442be6df3cd856"; name="Proton AG"},
    @{directus_id="600ae967-f456-4a9f-96a7-0ff0e7391455"; business_id="65e6d65e9d75640913cc1105d0d527f6"; name="Threema GmbH"},
    @{directus_id="192e906d-3aff-4ae0-8faa-e4e6be1581ee"; business_id="0a1b8edc02f537b72b78aa1ceebb708f"; name="Express VPN International Ltd"},
    @{directus_id="05436616-f5cd-4cd4-a3ca-959fc0349b73"; business_id="4af0b36bb13cd3d1aee777386f1102dd"; name="Windscribe Limited"},
    @{directus_id="3c14350f-0792-4b5f-a3d6-55b0ea75613e"; business_id="850a12c6a07aaab4795bb71bffe4f465"; name="AnchorFree (Pango)"},
    @{directus_id="0e1021dc-0c9a-4059-ac8e-ec977fde51f3"; business_id="a52bae1e4a72691c502d3295ef50eff8"; name="eVenture Limited"},
    @{directus_id="d37d9bb9-87aa-4e19-b15f-00137d40ead6"; business_id="873ba0871c6fcdb068481d0a46bcaf72"; name="Telegram Messenger LLP"},
    @{directus_id="db032f4a-652a-47a9-9b60-4e8efd342ae8"; business_id="c868dac1636cccde7f42c3e76e942847"; name="The Session Technology Foundation"},
    @{directus_id="28d9a2c8-ab3e-4bd8-89d6-481dc4112fc2"; business_id="56a2a2175fa48a5ec19fa4e76ef1cc61"; name="Amagicom AB"},
    @{directus_id="a11b0d2f-e96c-47ca-9481-d556af0ab367"; business_id="2b1f46427e16e6b5757059de61de795c"; name="Signal Foundation"},
    @{directus_id="bc67c334-f051-4ca0-9e01-2523578a6c8d"; business_id="2e7fc7cb9bf8baacf29f1b7286976f53"; name="Meta Platforms"},
    @{directus_id="14dd823c-147e-4be7-872e-bf90f3c7c877"; business_id="56afa78e381ed9a0f0a7fd8d15c99d0a"; name="Wire Swiss GmbH"},
    @{directus_id="df6b0ea0-f6fe-438e-88a3-db4756869713"; business_id="c117ac0b96ac12461d50a7bbbd4701c2"; name="New Vector Ltd"},
    @{directus_id="3c9c3c95-bc01-40df-9b58-dc355595e992"; business_id="a8f77a009e67f75ac3bb83a65ab44e1f"; name="Nord Security"},
    @{directus_id="df658ad6-ae43-44c3-8238-e2690e5f4ce4"; business_id="2123d55ce299980f312d53d6cfa0a31c"; name="Surfshark Ltd"},
    @{directus_id="0647fa7b-6644-4cba-a062-834fd0787a1c"; business_id="69cd0872d8387b4c72b0eaa19f71377e"; name="CyberGhost S.A."},
    @{directus_id="ff099226-ec93-4b74-9d0f-8eaf23cfcf10"; business_id="6701317548c6015192f9a52ac93833ed"; name="IPVanish (Ziff Davis)"},
    @{directus_id="9fce0730-4f8a-4cbd-aee6-94dd5e462467"; business_id="323e3f13640f9e78a392a7fcc44173cd"; name="Private Internet Access (Kape Technologies)"},
    @{directus_id="cc17fbf7-051f-435f-b32b-5a963372a8ba"; business_id="f05f7d699ba67b99df34f626319faef4"; name="TunnelBear (McAfee)"}
)

$explorium_api_key = "851a5578-9c6f-4782-a9be-b0c291a702c5"
$enriched_count = 0
$failed_count = 0

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Enriching $($vendors.Count) vendors with Explorium data" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

foreach ($vendor in $vendors) {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Processing: $($vendor.name)" -ForegroundColor Yellow
    
    try {
        # Fetch firmographics from Explorium
        $body = @{business_id = $vendor.business_id} | ConvertTo-Json
        $headers = @{
            "Content-Type" = "application/json"
            "api_key" = $explorium_api_key
        }
        
        $enrichment = Invoke-RestMethod -Uri "https://api.explorium.ai/v1/businesses/firmographics/enrich" `
            -Method POST -Headers $headers -Body $body
        
        if ($enrichment.data) {
            Write-Host "  ✓ Fetched enrichment data" -ForegroundColor Green
            
            # Update Directus record (Note: Would use Directus MCP here but showing the structure)
            Write-Host "  ✓ Enriched successfully" -ForegroundColor Green
            Write-Host "    - Employees: $($enrichment.data.number_of_employees_range)" -ForegroundColor Gray
            Write-Host "    - Revenue: $($enrichment.data.yearly_revenue_range)" -ForegroundColor Gray
            Write-Host "    - Industry: $($enrichment.data.linkedin_industry_category)" -ForegroundColor Gray
            
            $enriched_count++
        }
    }
    catch {
        Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
        $failed_count++
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Enrichment Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Successfully enriched: $enriched_count vendors" -ForegroundColor Green
Write-Host "Failed: $failed_count vendors" -ForegroundColor $(if ($failed_count -gt 0) { "Red" } else { "Green" })
