$ErrorActionPreference = 'Stop'

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   FIG NATIVE PDF CONVERSION - PERFORMANCE BENCHMARK   " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

$testPdf = "c:\Users\yunus\Desktop\CODING PROJECTS\apps\fig\scripts\sample.pdf"
$outDir = "c:\Users\yunus\Desktop\CODING PROJECTS\apps\fig\scripts\benchmark_output"
$renderer = "c:\Users\yunus\Desktop\CODING PROJECTS\apps\fig\scripts\render_pdf.ps1"

if (Test-Path $outDir) {
    Remove-Item -Recurse -Force $outDir
}
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$beforeMem = (Get-Process -Id $PID).WorkingSet64 / 1MB
Write-Host "Baseline PowerShell Memory: $([Math]::Round($beforeMem, 2)) MB" -ForegroundColor Yellow

# Measure PNG render
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$resPng = & powershell -NoProfile -ExecutionPolicy Bypass -File $renderer -InputPdf $testPdf -OutputDir $outDir -Format "png" -Scale 2.0
$sw.Stop()
$pngTimeMs = $sw.ElapsedMilliseconds

# Measure JPG render
$sw.Restart()
$resJpg = & powershell -NoProfile -ExecutionPolicy Bypass -File $renderer -InputPdf $testPdf -OutputDir $outDir -Format "jpg" -Scale 2.0
$sw.Stop()
$jpgTimeMs = $sw.ElapsedMilliseconds

$afterMem = (Get-Process -Id $PID).WorkingSet64 / 1MB

$pngFile = Get-Item (Join-Path $outDir "sample.png")
$jpgFile = Get-Item (Join-Path $outDir "sample.jpg")

Add-Type -AssemblyName System.Drawing
$pngImg = [System.Drawing.Image]::FromFile($pngFile.FullName)
$pngDims = "$($pngImg.Width)x$($pngImg.Height)"
$pngImg.Dispose()

$jpgImg = [System.Drawing.Image]::FromFile($jpgFile.FullName)
$jpgDims = "$($jpgImg.Width)x$($jpgImg.Height)"
$jpgImg.Dispose()

Write-Host "`n--- BENCHMARK RESULTS ---" -ForegroundColor Green
Write-Host "PDF -> PNG (2.0x DPI):"
Write-Host "  - Render Time: $pngTimeMs ms ($([Math]::Round($pngTimeMs / 1000, 2))s)"
Write-Host "  - Output Size: $([Math]::Round($pngFile.Length / 1024, 2)) KB"
Write-Host "  - Resolution : $pngDims px"

Write-Host "`nPDF -> JPG (90% Quality):"
Write-Host "  - Render Time: $jpgTimeMs ms ($([Math]::Round($jpgTimeMs / 1000, 2))s)"
Write-Host "  - Output Size: $([Math]::Round($jpgFile.Length / 1024, 2)) KB"
Write-Host "  - Resolution : $jpgDims px"

Write-Host "`nMemory Usage:"
Write-Host "  - Process RAM Before : $([Math]::Round($beforeMem, 2)) MB"
Write-Host "  - Process RAM Peak   : $([Math]::Round($afterMem, 2)) MB"
Write-Host "  - Net RAM Footprint  : $([Math]::Round($afterMem - $beforeMem, 2)) MB"
Write-Host "=========================================================" -ForegroundColor Cyan
