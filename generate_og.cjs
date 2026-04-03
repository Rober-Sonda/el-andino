const Jimp = require('jimp');

async function createOgImage() {
    try {
        console.log('Reading favicon.png (isotype)...');
        const icon = await Jimp.read('public/favicon.png');
        
        // Resize icon to fit nicely within 630 height (e.g. 400x400 max)
        icon.contain(400, 400);

        // Turn the icon completely white (if it is transparent, ignore transparency)
        icon.scan(0, 0, icon.bitmap.width, icon.bitmap.height, function(x, y, idx) {
            const alpha = this.bitmap.data[idx + 3];
            if (alpha > 0) {
                this.bitmap.data[idx] = 255;   // R
                this.bitmap.data[idx+1] = 255; // G
                this.bitmap.data[idx+2] = 255; // B
                // Alpha remains exactly what it was for smooth edges
            }
        });

        console.log('Creating green background #2a3325...');
        // #2a3325 -> rgba(42, 51, 37, 255) -> hex is 0x2A3325FF
        const bg = new Jimp(1200, 630, 0x2A3325FF);

        console.log('Compositing...');
        const x = (1200 - icon.bitmap.width) / 2;
        const y = (630 - icon.bitmap.height) / 2;
        bg.composite(icon, x, y);

        console.log('Saving to og-image.png...');
        await bg.writeAsync('public/og-image.png');
        console.log('Successfully generated og-image.png!');
    } catch (err) {
        console.error('Error generating image:', err);
    }
}

createOgImage();
