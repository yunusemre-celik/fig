# Fig Release Packaging & Compatibility Script
$ErrorActionPreference = 'Stop'

Write-Host "==> Fig Portable Release Paketi Hazırlanıyor..." -ForegroundColor Cyan

$baseDir = Split-Path -Parent $PSScriptRoot
$releaseExe = "$baseDir\src-tauri\target\release\fig.exe"
$releaseDll = "$baseDir\src-tauri\target\release\WebView2Loader.dll"

if (-not (Test-Path $releaseExe)) {
    # Check X: drive fallback if mapped
    if (Test-Path "X:\src-tauri\target\release\fig.exe") {
        $releaseExe = "X:\src-tauri\target\release\fig.exe"
        $releaseDll = "X:\src-tauri\target\release\WebView2Loader.dll"
    } else {
        Write-Error "Hata: Release fig.exe bulunamadı!"
        exit 1
    }
}

Write-Host "1. Binary ve DLL dosyaları kopyalanıyor..." -ForegroundColor Green
Copy-Item -Path $releaseExe -Destination "$baseDir\Fig.exe" -Force
Copy-Item -Path $releaseExe -Destination "$baseDir\docs\Fig.exe" -Force
Copy-Item -Path $releaseExe -Destination "$baseDir\landing\public\Fig.exe" -Force

if (Test-Path $releaseDll) {
    Copy-Item -Path $releaseDll -Destination "$baseDir\WebView2Loader.dll" -Force
    Copy-Item -Path $releaseDll -Destination "$baseDir\docs\WebView2Loader.dll" -Force
    Copy-Item -Path $releaseDll -Destination "$baseDir\landing\public\WebView2Loader.dll" -Force
}

Write-Host "2. Portable ZIP arşivi oluşturuluyor (W10 & W11 uyumlu)..." -ForegroundColor Green
$tempZipFolder = Join-Path $env:TEMP "Fig_Release_Package_$(Get-Random)"
New-Item -ItemType Directory -Path $tempZipFolder -Force | Out-Null

Copy-Item -Path "$baseDir\Fig.exe" -Destination $tempZipFolder -Force
Copy-Item -Path "$baseDir\WebView2Loader.dll" -Destination $tempZipFolder -Force
Copy-Item -Path "$baseDir\BeniOku.txt" -Destination $tempZipFolder -Force
Copy-Item -Path "$baseDir\README.txt" -Destination $tempZipFolder -Force

$zipPath = "$baseDir\Fig-Windows-x64.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Compress-Archive -Path "$tempZipFolder\*" -DestinationPath $zipPath -CompressionLevel Optimal
Remove-Item -Path $tempZipFolder -Recurse -Force

Copy-Item -Path $zipPath -Destination "$baseDir\docs\Fig-Windows-x64.zip" -Force
Copy-Item -Path $zipPath -Destination "$baseDir\landing\public\Fig-Windows-x64.zip" -Force

$zipSizeMb = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "==> Başarılı! Fig-Windows-x64.zip boyutu: $zipSizeMb MB" -ForegroundColor Green

Write-Host "3. ZIP Arşiv İçeriği Kontrol Ediliyor:" -ForegroundColor Yellow
tar -tf $zipPath
