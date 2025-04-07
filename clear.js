const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, 'public');

fs.readdir(folderPath, (err, files) => {
  if (err) {
    return console.error('❌ Gagal membaca folder:', err.message);
  }

  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    
    // Pastikan hanya file (bukan folder)
    if (fs.lstatSync(filePath).isFile()) {
      fs.writeFile(filePath, '', (err) => {
        if (err) {
          console.error(`❌ Gagal mengosongkan ${file}:`, err.message);
        } else {
          console.log(`✅ File dikosongkan: ${file}`);
        }
      });
    }
  });
});
