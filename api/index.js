const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());

let katalogData = {};

// Load katalog
function loadKatalog() {
  const katalogPath = path.join(__dirname, '..', 'katalog.tsv');
  fs.createReadStream(katalogPath)
    .pipe(csv({ separator: '\t' }))
    .on('data', (row) => {
      const namaBarang = (row['Nama Barang'] || '').toLowerCase().trim();
      if (namaBarang) {
        katalogData[namaBarang] = row;
      }
    })
    .on('end', () => {
      console.log('Katalog loaded');
    });
}

// Webhook endpoint
app.post('/', (req, res) => {
  const message = (req.body.message || '').toLowerCase().trim();
  console.log('Received:', message);

  let responseText = 'Maaf, produk tidak ditemukan.';

  if (katalogData[message]) {
    const produk = katalogData[message];
    responseText = `📦 ${produk['Nama Barang']}\n💵 Harga jual: Rp ${produk['Harga Jual']}/pcs`;
  }

  res.json({ reply: responseText });
});

// ini WAJIB, untuk vercel:
module.exports = app;

loadKatalog();
