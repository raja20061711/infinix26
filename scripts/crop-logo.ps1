param(
    [string]$imgPath = 'c:\Users\rajak\OneDrive\Desktop\website\public\brassy-academy-logo.png'
)

Add-Type -AssemblyName System.Drawing

# Load image
$bytes = [System.IO.File]::ReadAllBytes($imgPath)
$ms = New-Object System.IO.MemoryStream(,$bytes)
$src = [System.Drawing.Bitmap]::FromStream($ms)

$minX = $src.Width
$maxX = 0
$minY = $src.Height
$maxY = 0

for ($y = 0; $y -lt $src.Height; $y++) {
    for ($x = 0; $x -lt $src.Width; $x++) {
        $c = $src.GetPixel($x, $y)
        # Non-white / non-transparent pixels
        if ($c.R -lt 245 -or $c.G -lt 245 -or $c.B -lt 245) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$pad = 15
$minX = [Math]::Max(0, $minX - $pad)
$minY = [Math]::Max(0, $minY - $pad)
$maxX = [Math]::Min($src.Width - 1, $maxX + $pad)
$maxY = [Math]::Min($src.Height - 1, $maxY + $pad)

$cropWidth = $maxX - $minX + 1
$cropHeight = $maxY - $minY + 1

$cropped = New-Object System.Drawing.Bitmap($cropWidth, $cropHeight)
$g = [System.Drawing.Graphics]::FromImage($cropped)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

$rectDst = New-Object System.Drawing.Rectangle(0, 0, $cropWidth, $cropHeight)
$rectSrc = New-Object System.Drawing.Rectangle($minX, $minY, $cropWidth, $cropHeight)
$g.DrawImage($src, $rectDst, $rectSrc, [System.Drawing.GraphicsUnit]::Pixel)

$src.Dispose()
$ms.Dispose()
$g.Dispose()

$cropped.Save($imgPath, [System.Drawing.Imaging.ImageFormat]::Png)
$cropped.Dispose()
Write-Host "Cropped $imgPath tightly and cleanly!"
