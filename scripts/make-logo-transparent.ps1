Add-Type -AssemblyName System.Drawing

$imgPath = 'c:\Users\rajak\OneDrive\Desktop\website\public\chapter-logo.png'
$bytes = [System.IO.File]::ReadAllBytes($imgPath)
$ms = New-Object System.IO.MemoryStream(,$bytes)
$src = [System.Drawing.Bitmap]::FromStream($ms)

$width = $src.Width
$height = $src.Height

# Create ARGB bitmap with transparency for pure white / near-white background
$bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($src, 0, 0, $width, $height)
$g.Dispose()

$minX = $width
$maxX = 0
$minY = $height
$maxY = 0

for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # If pixel is white / near white (background)
        if ($c.R -gt 240 -and $c.G -gt 240 -and $c.B -gt 240) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$src.Dispose()
$ms.Dispose()

$pad = 10
$minX = [Math]::Max(0, $minX - $pad)
$minY = [Math]::Max(0, $minY - $pad)
$maxX = [Math]::Min($width - 1, $maxX + $pad)
$maxY = [Math]::Min($height - 1, $maxY + $pad)

$cropWidth = $maxX - $minX + 1
$cropHeight = $maxY - $minY + 1

$cropped = New-Object System.Drawing.Bitmap($cropWidth, $cropHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g2 = [System.Drawing.Graphics]::FromImage($cropped)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

$rectDst = New-Object System.Drawing.Rectangle(0, 0, $cropWidth, $cropHeight)
$rectSrc = New-Object System.Drawing.Rectangle($minX, $minY, $cropWidth, $cropHeight)
$g2.DrawImage($bmp, $rectDst, $rectSrc, [System.Drawing.GraphicsUnit]::Pixel)

$bmp.Dispose()
$g2.Dispose()

$cropped.Save($imgPath, [System.Drawing.Imaging.ImageFormat]::Png)
$cropped.Dispose()

Write-Host "Processed transparent logo: ${cropWidth}x${cropHeight}"
