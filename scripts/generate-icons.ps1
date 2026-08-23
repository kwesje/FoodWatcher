# Genereert de PWA-appiconen (icons/icon-*.png) met .NET System.Drawing.
# Eenmalig te draaien; de output wordt gecommit zodat er geen build-stap nodig is.

Add-Type -AssemblyName System.Drawing

$root = Resolve-Path "$PSScriptRoot\.."
$iconsDir = Join-Path $root "icons"
if (-not (Test-Path $iconsDir)) { New-Item -ItemType Directory -Path $iconsDir | Out-Null }

$bgColor = [System.Drawing.Color]::FromArgb(255, 0xe0, 0x32, 0x7d)
$textColor = [System.Drawing.Color]::White

function New-Icon {
    param(
        [int]$Size,
        [string]$Path,
        [bool]$Maskable
    )

    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

    $brushBg = New-Object System.Drawing.SolidBrush $bgColor

    if ($Maskable) {
        # Maskable iconen: volledig gevuld canvas (geen ronde hoeken), content ruim
        # binnen de veilige zone (centrale ~80%) zodat OS-vormen niets afsnijden.
        $g.FillRectangle($brushBg, 0, 0, $Size, $Size)
    } else {
        $radius = [int]($Size * 0.22)
        $path2 = New-Object System.Drawing.Drawing2D.GraphicsPath
        $d = $radius * 2
        $path2.AddArc(0, 0, $d, $d, 180, 90)
        $path2.AddArc($Size - $d, 0, $d, $d, 270, 90)
        $path2.AddArc($Size - $d, $Size - $d, $d, $d, 0, 90)
        $path2.AddArc(0, $Size - $d, $d, $d, 90, 90)
        $path2.CloseFigure()
        $g.FillPath($brushBg, $path2)
    }

    $fontSize = [single]($Size * 0.38)
    $font = New-Object System.Drawing.Font("Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold)
    $brushText = New-Object System.Drawing.SolidBrush $textColor
    $text = "FW"
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rect = New-Object System.Drawing.RectangleF 0, 0, $Size, $Size
    $g.DrawString($text, $font, $brushText, $rect, $format)

    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

New-Icon -Size 192 -Path (Join-Path $iconsDir "icon-192.png") -Maskable $false
New-Icon -Size 512 -Path (Join-Path $iconsDir "icon-512.png") -Maskable $false
New-Icon -Size 192 -Path (Join-Path $iconsDir "icon-maskable-192.png") -Maskable $true
New-Icon -Size 512 -Path (Join-Path $iconsDir "icon-maskable-512.png") -Maskable $true

Write-Host "Icons generated in $iconsDir"
