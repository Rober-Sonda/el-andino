const Jimp = require('jimp');

async function processLogos() {
    console.log('Loading logo_nav.png ...');
    const fullLogo = await Jimp.read('public/logo_nav.png');
    console.log('Original size:', fullLogo.bitmap.width, 'x', fullLogo.bitmap.height);
    // Assuming the icon is on the left and takes ~20% of width. Let's crop the right 80%.
    // Usually isologotipos have the icon on the left, then text.
    // Let's crop 25% from the left to isolate the text.
    const cropX = Math.floor(fullLogo.bitmap.width * 0.28);
    const cropWidth = fullLogo.bitmap.width - cropX;
    
    // Create text-only logo
    const textLogo = fullLogo.clone().crop(cropX, 0, cropWidth, fullLogo.bitmap.height);
    await textLogo.writeAsync('public/logotipo_verde.png');
    console.log('Saved logotipo_verde.png');
    
    // Create white version
    textLogo.scan(0, 0, textLogo.bitmap.width, textLogo.bitmap.height, function(x, y, idx) {
        if (this.bitmap.data[idx+3] > 0) {
            this.bitmap.data[idx]=255;
            this.bitmap.data[idx+1]=255;
            this.bitmap.data[idx+2]=255;
        }
    });
    await textLogo.writeAsync('public/logotipo_blanco.png');
    console.log('Saved logotipo_blanco.png');
}

processLogos().catch(console.error);
