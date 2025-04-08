const express = require('express');
const fs = require('fs');
const csv = require('csv-parser'); // untuk baca TSV
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let products = [];

// Load database dari file
fs.createReadStream('PL_KATALOG_ZONA.tsv')
  .pipe(csv({ separator: '\t' })) // karena file TSV (tab)
  .on('data', (row) => {
    products.push(row);
  })
  .on('end', () => {
    console.log('Database loaded!');
  });

// Webhook endpoint
app.post('/message', (req, res) => {
  const { message, sender } = req.body;

  console.log(`Incoming message from ${sender}: ${message}`);

  const found = products.find(item => item['UKURAN CUP'].toLowerCase() === message.toLowerCase());

  let reply;
  if (found) {
    reply = `📦 ${found['UKURAN CUP']}\n💵 Harga jual: Rp ${found['HPJ']}/pcs`;
  } else {
    reply = 'Maaf, produk tidak ditemukan.';
  }

  // Balasan ke WA (contoh response)
  res.json({
    receiver: sender,
    message: reply
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook running on port ${PORT}`);
});
