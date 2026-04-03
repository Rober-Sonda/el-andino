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
    console.log('Downloading Premium Full...');
    await downloadFile('1F-WSzpd_5dGVaotbalOALlNMff97e1dn', 'public/premium_full.jpg');
    console.log('Downloading Ahumada Full...');
    await downloadFile('1X09MlVg11Fa5lCblIC5Xrf5Jpa0lJUDy', 'public/ahumada_full.jpg');
    console.log('Downloading Despalada Full...');
    await downloadFile('1Zca4eFiiyp3lMRXVaOCjWKBOSFYHEYzb', 'public/despalada_full.jpg');
    console.log('Downloading Molida Full...');
    await downloadFile('1STGL06iPad4q0FGicwL_4KBZtj-bZqHf', 'public/molida_full.jpg');
    console.log('Todos los archivos full descargados correctamente');
  } catch (err) {
    console.error('Error:', err);
  }
})();
