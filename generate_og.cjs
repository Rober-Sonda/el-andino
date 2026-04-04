const Jimp = require('jimp');

async function createOgImage() {
    try {
        console.log('Reading logo...');
        const icon = await Jimp.read('public/logo_nav.png');
        
        console.log('Turning icon white...');
        icon.scan(0, 0, icon.bitmap.width, icon.bitmap.height, function(x, y, idx) {
            const alpha = this.bitmap.data[idx + 3];
            if (alpha > 0) {
                this.bitmap.data[idx] = 255;
                this.bitmap.data[idx+1] = 255;
                this.bitmap.data[idx+2] = 255;
            }
        });

        // Make it much bigger
        icon.contain(1000, 450);

        console.log('Reading background image...');
        // Let's try hero_campo.png. If it fails, fallback to green.
        let bg;
        try {
            bg = await Jimp.read('public/hero_campo.png');
            bg.cover(1200, 630); // Resize and crop to perfectly fit 1200x630
            
            console.log('Applying dark overlay to background...');
            const overlay = new Jimp(1200, 630, 0x0000008A); // Black with ~55% opacity
            bg.composite(overlay, 0, 0);
        } catch (e) {
            console.log('Could not find hero_campo.png, falling back to green.');
            bg = new Jimp(1200, 630, 0x2A3325FF);
        }

        console.log('Compositing...');
        const x = (1200 - icon.bitmap.width) / 2;
        const y = (630 - icon.bitmap.height) / 2;
        bg.composite(icon, x, y);

        console.log('Saving to og-image.jpg...');
        await bg.quality(80).writeAsync('public/og-image.jpg');
        console.log('Successfully generated og-image.jpg (optimized size)!');
    } catch (err) {
        console.error('Error generating image:', err);
    }
}

createOgImage();
