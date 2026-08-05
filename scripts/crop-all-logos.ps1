Add-Type -AssemblyName System.Drawing

function Crop-Tight ($imgPath, $pad = 8) {
    if (-not (Test-Path $imgPath)) { return }
    $bytes = [System.IO.File]::ReadAllBytes($imgPath)
    $ms = New-Object System.IO.MemoryStream(,$bytes)
    $src = [System.Drawing.Bitmap]::FromStream($ms)

    $minX = $src.Width
    $maxX = 0
    $minY = $src.Height
    $maxY = 0

    # Scan for bounding box of non-transparent and non-pure-white/non-bg content
    for ($y = 0; $y -lt $src.Height; $y++) {
        for ($x = 0; $x -lt $src.Width; $x++) {
            $c = $src.GetPixel($x, $y)
            if ($c.A -gt 10) { # Visible pixel
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }

    if ($minX -ge $maxX -or $minY -ge $maxY) {
        $src.Dispose()
        $ms.Dispose()
        return
    }

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
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $rectDst = New-Object System.Drawing.Rectangle(0, 0, $cropWidth, $cropHeight)
    $rectSrc = New-Object System.Drawing.Rectangle($minX, $minY, $cropWidth, $cropHeight)
    $g.DrawImage($src, $rectDst, $rectSrc, [System.Drawing.GraphicsUnit]::Pixel)

    $src.Dispose()
    $ms.Dispose()
    $g.Dispose()

    $cropped.Save($imgPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    Write-Host "Re-cropped $imgPath cleanly to ${cropWidth}x${cropHeight}"
}

Crop-Tight 'c:\Users\rajak\OneDrive\Desktop\website\public\three-monkeys-logo.png' 5
Crop-Tight 'c:\Users\rajak\OneDrive\Desktop\website\public\brassy-academy-logo.png' 5
Crop-Tight 'c:\Users\rajak\OneDrive\Desktop\website\public\cadd-technolynx-logo.png' 5
