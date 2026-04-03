const fs = require('fs');
const https = require('https');

function downloadFile(id, path) {
  const url = 'https://drive.google.com/uc?export=download&id=' + id;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (redirectRes) => {
          const file = fs.createWriteStream(path);
          redirectRes.pipe(file);
          file.on('finish', () => { file.close(resolve); });
        }).on('error', reject);
      } else {
        const file = fs.createWriteStream(path);
        res.pipe(file);
        file.on('finish', () => { file.close(resolve); });
      }
    }).on('error', reject);
  });
}

(async () => {
  try {
    await downloadFile('1HsXzUUBmjsjorTm7Usp4DTU7P-Q0oqEg', 'public/premium.png');
    console.log('Downloading Ahumada...');
    await downloadFile('1IfU_kipZGaohXdXsnveXJ42H9tFFW3eG', 'public/ahumada.png');
    console.log('Downloading Despalada...');
    await downloadFile('1_S3fG71s8K4coezR6SBMMXHq6ISGuQ22', 'public/despalada.png');
    console.log('Downloading Molida...');
    await downloadFile('1vIUZUEfAR74stntoq1Ry__ONbcxeOqKc', 'public/molida.png');
    console.log('Downloading Favicon...');
    await downloadFile('18mGwm5WA5TRxRPBxyjJpudVOh51gmCcw', 'public/favicon.png');
    console.log('Downloading og-image...');
    await downloadFile('1iVDqBSUX-ZVTjrYe5kOwWgt9AGOBhgSu', 'public/og-image.png');
    console.log('Downloading logo-nav...');
    await downloadFile('170GzQsyHyh02u-EwNvrNSE8bYekfcZ2i', 'public/logo_nav.png');
    console.log('Downloading logo-hero...');
    await downloadFile('1KYDTn-leWxD1Rm4_pSzGrZq091tXUibl', 'public/logo_hero.png');
    console.log('Todos los archivos descargados correctamente');
  } catch (err) {
    console.error('Error:', err);
  }
})();
