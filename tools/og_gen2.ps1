Add-Type -AssemblyName System.Drawing

$bg = [System.Drawing.Image]::FromFile("C:\src\el-andino\public\hero_argentino.png")
$logo = [System.Drawing.Image]::FromFile("C:\src\el-andino\public\isotipo.png")

$targetWidth = 1200
$targetHeight = 630

$bmp = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
$graph = [System.Drawing.Graphics]::FromImage($bmp)
$graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graph.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

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

$logoWidth = 220
$logoHeight = $logo.Height * ($logoWidth / $logo.Width)
$logoX = ($targetWidth - $logoWidth) / 2
$logoY = ($targetHeight / 2) - $logoHeight + 40

$graph.DrawImage($logo, [int]$logoX, [int]$logoY, [int]$logoWidth, [int]$logoHeight)

$font = New-Object System.Drawing.Font("Georgia", 64, [System.Drawing.FontStyle]::Bold)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 0, 0, 0))

$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center

$text = "EL ANDINO"
$textY = $logoY + $logoHeight + 20
$rect = New-Object System.Drawing.RectangleF(0, $textY, $targetWidth, 100)
$shadowRect = New-Object System.Drawing.RectangleF(5, $textY + 5, $targetWidth, 100)

$graph.DrawString($text, $font, $shadowBrush, $shadowRect, $format)
$graph.DrawString($text, $font, $brush, $rect, $format)

$fontSub = New-Object System.Drawing.Font("Arial", 24, [System.Drawing.FontStyle]::Regular)
$textSub = "YERBA MATE PREMIUM"
$textSubY = $textY + 85
$rectSub = New-Object System.Drawing.RectangleF(0, $textSubY, $targetWidth, 50)
$shadowRectSub = New-Object System.Drawing.RectangleF(3, $textSubY + 3, $targetWidth, 50)

$graph.DrawString($textSub, $fontSub, $shadowBrush, $shadowRectSub, $format)
$graph.DrawString($textSub, $fontSub, $brush, $rectSub, $format)

$bmp.Save("C:\src\el-andino\public\og_hero.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)

$font.Dispose()
$brush.Dispose()
$shadowBrush.Dispose()
$fontSub.Dispose()
$format.Dispose()
$graph.Dispose()
$bmp.Dispose()
$bg.Dispose()
$logo.Dispose()
Write-Host "Success"
