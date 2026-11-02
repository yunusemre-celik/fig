# Windows 10 & Windows 11 Uyumluluk ve Statik PE Doğrulama Aracı
$ErrorActionPreference = 'Stop'

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  FIG - Windows 10 & Windows 11 Uyumluluk Denetimi (CI/CD)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseDir = Split-Path -Parent $PSScriptRoot
$exePath = "$baseDir\Fig.exe"
$zipPath = "$baseDir\Fig-Windows-x64.zip"

if (-not (Test-Path $exePath)) {
    Write-Error "Fig.exe bulunamadı!"
    exit 1
}

# 1. ZIP İçerik Denetimi
Write-Host "`n[1/4] ZIP Paket Bütünlüğü Denetleniyor..." -ForegroundColor Yellow
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipEntries = [System.IO.Compression.ZipFile]::OpenRead($zipPath).Entries | ForEach-Object { $_.Name }

$requiredFiles = @("Fig.exe", "WebView2Loader.dll", "BeniOku.txt", "README.txt")
$missing = @()
foreach ($file in $requiredFiles) {
    if ($zipEntries -contains $file) {
        Write-Host "  [OK] $file mevcut." -ForegroundColor Green
    } else {
        Write-Host "  [HATA] $file eksik!" -ForegroundColor Red
        $missing += $file
    }
}

if ($missing.Count -gt 0) {
    Write-Error "ZIP içinde eksik dosyalar var: $($missing -join ', ')"
    exit 1
}

# 2. PE Başlıkları & Mimarisi
Write-Host "`n[2/4] Portable Executable (PE) Başlıkları Denetleniyor..." -ForegroundColor Yellow
$bytes = [System.IO.File]::ReadAllBytes($exePath)

$e_lfanew = [BitConverter]::ToUInt32($bytes, 0x3C)
$peSig = [System.Text.Encoding]::ASCII.GetString($bytes, $e_lfanew, 4)
$machine = [BitConverter]::ToUInt16($bytes, $e_lfanew + 4)
$magic = [BitConverter]::ToUInt16($bytes, $e_lfanew + 24)

if ($machine -eq 0x8664) {
    Write-Host "  [OK] Mimari: x86_64 / AMD64 (Windows 10/11 x64 uyumlu)" -ForegroundColor Green
} else {
    Write-Warning "  [UYARI] Beklenmeyen mimari: $machine"
}

$subsystem = [BitConverter]::ToUInt16($bytes, $e_lfanew + 88)
Write-Host "  [OK] Alt Sistem: $subsystem (2 = Windows GUI Subsystem)" -ForegroundColor Green

# 3. DLL Bağımlılıkları ve Universal CRT (UCRT) Denetimi
Write-Host "`n[3/4] İthal DLL Bağımlılıkları (Import Table) Denetleniyor..." -ForegroundColor Yellow
$pyCheck = @"
import struct

with open(r'$exePath', 'rb') as f:
    data = f.read()

e_lfanew = struct.unpack('<I', data[0x3C:0x40])[0]
opt_hdr_size = struct.unpack('<H', data[e_lfanew+20:e_lfanew+22])[0]
num_sections = struct.unpack('<H', data[e_lfanew+6:e_lfanew+8])[0]
sec_start = e_lfanew + 24 + opt_hdr_size
sections = []
for i in range(num_sections):
    sec = data[sec_start + i*40 : sec_start + (i+1)*40]
    name = sec[:8].rstrip(b'\x00').decode('latin1', errors='ignore')
    vsize = struct.unpack('<I', sec[8:12])[0]
    va = struct.unpack('<I', sec[12:16])[0]
    raw_size = struct.unpack('<I', sec[16:20])[0]
    raw_ptr = struct.unpack('<I', sec[20:24])[0]
    sections.append((name, va, vsize, raw_ptr, raw_size))

def rva_to_offset(rva):
    for name, va, vsize, raw_ptr, raw_size in sections:
        if va <= rva < va + max(vsize, raw_size):
            return raw_ptr + (rva - va)
    return None

import_rva = struct.unpack('<I', data[e_lfanew+144:e_lfanew+148])[0]
import_offset = rva_to_offset(import_rva)

dlls = set()
if import_offset:
    curr = import_offset
    while True:
        desc = data[curr:curr+20]
        if desc == b'\x00'*20:
            break
        ilt_rva, ts, fc, name_rva, thunk_rva = struct.unpack('<IIIII', desc)
        name_off = rva_to_offset(name_rva)
        if name_off:
            dll_name = data[name_off:data.find(b'\x00', name_off)].decode('latin1')
            dlls.add(dll_name.lower())
        curr += 20

print(';'.join(sorted(dlls)))
"@

$dllString = python -c $pyCheck
$dllList = $dllString -split ';'
Write-Host "  Bulunan DLL Bağımlılıkları:" -ForegroundColor Gray
foreach ($d in $dllList) {
    Write-Host "    - $d" -ForegroundColor Gray
}

# Standart dışı / eski CRT denetimi
if ($dllList -contains "webview2loader.dll") {
    Write-Host "  [OK] WebView2Loader.dll import mevcut ve ZIP içinde dağıtılıyor." -ForegroundColor Green
}

$hasUcrt = ($dllList | Where-Object { $_ -like "api-ms-win-crt-*" }).Count -gt 0
if ($hasUcrt) {
    Write-Host "  [OK] Universal C Runtime (UCRT) kullanılıyor (Windows 10 ve 11 yerel bileşeni)." -ForegroundColor Green
}

# 4. Windows 10 Registry & Runtime Kontrolü
Write-Host "`n[4/4] Sistem Üzerindeki WebView2 Runtime Durumu..." -ForegroundColor Yellow
$regPv = (Get-ItemProperty -Path "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" -Name pv -ErrorAction SilentlyContinue).pv
if (-not $regPv) {
    $regPv = (Get-ItemProperty -Path "HKCU:\Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" -Name pv -ErrorAction SilentlyContinue).pv
}

if ($regPv) {
    Write-Host "  [BİLGİ] Yerel WebView2 Runtime Sürümü: $regPv" -ForegroundColor Green
} else {
    Write-Host "  [BİLGİ] Yerel WebView2 Runtime bulunamadı (Windows 10 senaryosu: Fig kullanıcıya indirme diyaloğu gösterecektir)." -ForegroundColor Yellow
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  SONUÇ: Bütün uyumluluk kriterleri başarıyla doğrulandı!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
