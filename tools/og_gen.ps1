Add-Type -AssemblyName System.Drawing

$bg = [System.Drawing.Image]::FromFile("C:\src\el-andino\public\hero_argentino.png")
$logo = [System.Drawing.Image]::FromFile("C:\src\el-andino\public\logotipo_blanco.png")

$targetWidth = 1200
$targetHeight = 630

$bmp = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
$graph = [System.Drawing.Graphics]::FromImage($bmp)
$graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$srcRatio = $bg.Width / $bg.Height
$targetRatio = $targetWidth / $targetHeight

$srcX = 0; $srcY = 0; $srcW = $bg.Width; $srcH = $bg.Height

if ($srcRatio -gt $targetRatio) {
    $newW = $bg.Height * $targetRatio
    $srcX = ($bg.Width - $newW) / 2
    $srcW = $newW
} else {
    $newH = $bg.Width / $targetRatio
    $srcY = ($bg.Height - $newH) / 2
    $srcH = $newH
}

$graph.DrawImage($bg, [System.Drawing.Rectangle]::new(0, 0, $targetWidth, $targetHeight), $srcX, $srcY, $srcW, $srcH, [System.Drawing.GraphicsUnit]::Pixel)

$logoWidth = 400
$logoHeight = $logo.Height * ($logoWidth / $logo.Width)
$logoX = ($targetWidth - $logoWidth) / 2
$logoY = ($targetHeight - $logoHeight) / 2

$graph.DrawImage($logo, [int]$logoX, [int]$logoY, [int]$logoWidth, [int]$logoHeight)

$bmp.Save("C:\src\el-andino\public\og_hero.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)

$graph.Dispose()
$bmp.Dispose()
$bg.Dispose()
$logo.Dispose()
Write-Host "Success"
