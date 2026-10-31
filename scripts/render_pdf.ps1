param(
    [Parameter(Mandatory=$true)]
    [string]$InputPdf,
    
    [Parameter(Mandatory=$true)]
    [string]$OutputDir,
    
    [string]$Format = "png",
    
    [double]$Scale = 2.0,
    
    [string]$BaseName = ""
)

$ErrorActionPreference = 'Stop'

try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    Add-Type -AssemblyName System.Drawing

    $asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
    }[0]

    $asTaskAction = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction'
    }[0]

    function Await-WinRT($asyncOp, $type) {
        if ($type) {
            $asTask = $asTaskGeneric.MakeGenericMethod($type)
            $netTask = $asTask.Invoke($null, @($asyncOp))
            $netTask.Wait()
            return $netTask.Result
        } else {
            $netTask = $asTaskAction.Invoke($null, @($asyncOp))
            $netTask.Wait()
        }
    }

    [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Pdf.PdfPageRenderOptions, Windows.Data.Pdf, ContentType = WindowsRuntime] | Out-Null
    [Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime] | Out-Null

    if (-not (Test-Path $OutputDir)) {
        New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
    }

    $fullInPath = (Resolve-Path -LiteralPath $InputPdf).Path
    $storageFileOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($fullInPath)
    $storageFile = Await-WinRT $storageFileOp ([Windows.Storage.StorageFile])

    $docOp = [Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($storageFile)
    $pdfDoc = Await-WinRT $docOp ([Windows.Data.Pdf.PdfDocument])

    $pageCount = $pdfDoc.PageCount
    if ($pageCount -eq 0) {
        Write-Error "PDF belgesinde sayfa bulunamadi."
        exit 1
    }

    $fmtLower = $Format.ToLower().Trim()
    $ext = if ($fmtLower -eq "jpg" -or $fmtLower -eq "jpeg") { "jpg" } else { "png" }
    
    $prefix = if ($BaseName) { $BaseName } else { [System.IO.Path]::GetFileNameWithoutExtension($fullInPath) }

    $options = [Windows.Data.Pdf.PdfPageRenderOptions]::new()
    $createdFiles = @()

    for ($i = 0; $i -lt $pageCount; $i++) {
        $page = $pdfDoc.GetPage($i)
        $memStream = [Windows.Storage.Streams.InMemoryRandomAccessStream]::new()
        
        if ($Scale -gt 1.0) {
            $options.DestinationWidth = [uint32][Math]::Round($page.Size.Width * $Scale)
            $options.DestinationHeight = [uint32][Math]::Round($page.Size.Height * $Scale)
        }
        
        $renderOp = $page.RenderToStreamAsync($memStream, $options)
        Await-WinRT $renderOp $null
        
        $reader = [Windows.Storage.Streams.DataReader]::new($memStream.GetInputStreamAt(0))
        $loadOp = $reader.LoadAsync($memStream.Size)
        $bytesLoaded = Await-WinRT $loadOp ([uint32])
        
        $bytes = New-Object byte[] $bytesLoaded
        $reader.ReadBytes($bytes)
        
        $outFileName = if ($pageCount -eq 1) {
            "$prefix.$ext"
        } else {
            "${prefix}_sayfa_$($i + 1).$ext"
        }
        $outFilePath = Join-Path $OutputDir $outFileName
        
        if ($ext -eq "jpg") {
            # Convert rendered stream to JPEG via System.Drawing
            $ms = [System.IO.MemoryStream]::new($bytes)
            $bmp = [System.Drawing.Image]::FromStream($ms)
            $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatID -eq [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid }
            $encParams = [System.Drawing.Imaging.EncoderParameters]::new(1)
            $encParams.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]90)
            $bmp.Save($outFilePath, $encoder, $encParams)
            $bmp.Dispose()
            $ms.Dispose()
        } else {
            [System.IO.File]::WriteAllBytes($outFilePath, $bytes)
        }
        
        $reader.Dispose()
        $memStream.Dispose()
        $page.Dispose()
        
        $createdFiles += $outFilePath
    }

    Write-Output "SUCCESS: $($createdFiles -join ';')"
} catch {
    Write-Error "PDF Render Hatasi: $_"
    exit 1
}
