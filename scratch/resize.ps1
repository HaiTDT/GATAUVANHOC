Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$Path,
        [int]$Width,
        [int]$Height
    )
    
    Write-Output "Resizing $Path to ${Width}x${Height}..."
    
    # Check if file exists
    if (-not (Test-Path $Path)) {
        Write-Warning "File not found: $Path"
        return
    }
    
    # Load the image from file
    $srcImage = [System.Drawing.Image]::FromFile($Path)
    
    # Create target bitmap
    $destBitmap = New-Object System.Drawing.Bitmap($Width, $Height)
    
    # Create graphics object to perform the resize
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    
    # Configure high quality settings
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Draw source image onto the destination bitmap
    $graphics.DrawImage($srcImage, 0, 0, $Width, $Height)
    
    # Clean up source image and graphics objects to release file lock
    $graphics.Dispose()
    $srcImage.Dispose()
    
    # Save the resized image (overwriting the original)
    $destBitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBitmap.Dispose()
    
    Write-Output "Successfully resized and saved: $Path"
}

# Paths to the icon files
$iconPath = "c:\Users\THINKPAD\Documents\GTVH\MIS_HASAKI_SRC_CODE\client\src\app\icon.png"
$appleIconPath = "c:\Users\THINKPAD\Documents\GTVH\MIS_HASAKI_SRC_CODE\client\src\app\apple-icon.png"

# Resize both to 192x192 (which is 48 * 4)
Resize-Image -Path $iconPath -Width 192 -Height 192
Resize-Image -Path $appleIconPath -Width 192 -Height 192
