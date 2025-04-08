const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const dotenv = require('dotenv');
const app = express();
dotenv.config(); // Load .env file

const PORT = process.env.PORT || 3000;

// Setup Google Sheets
const doc = new GoogleSpreadsheet(process.env.SHEET_ID);

// Middleware untuk parsing JSON
app.use(express.json());

// ====== FUNCTION UTAMA ======

// Fungsi untuk ambil data dari Google Sheets
async function ambilDataSheet() {
  try {
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo(); // Load spreadsheet info
    const sheet = doc.sheetsByIndex[0]; // Ambil sheet pertama
    const rows = await sheet.getRows();
    return rows.map(row => row._rawData); // Kembalikan semua data
  } catch (err) {
    console.error('Error ambil data sheet:', err);
    return [];
  }
}

// Fungsi untuk logika membalas pesan
async function balasPesan(message) {
  const dataSheet = await ambilDataSheet();
  
  // Contoh: cari jawaban di Google Sheet
  const jawaban = dataSheet.find(row => row[0] === message); // Asumsikan kolom pertama = pertanyaan
  
  if (jawaban) {
    return `Jawaban dari sheet: ${jawaban[1]}`; // Misal kolom kedua adalah jawabannya
  } else {
    return "Maaf, saya tidak mengerti pertanyaan Anda.";
  }
}

// ====== ENDPOINTS ======

// Default route
app.get('/', (req, res) => {
  res.send('Server WhatsApp Bot Jalan 🚀');
});

// Endpoint untuk WhatsAuto kirim pesan (bisa /webhook atau /message.php)
app.post(['/webhook', '/message.php'], async (req, res) => {
  try {
    const data = req.body;
    console.log('Data diterima dari WhatsAuto:', data);

    const message = data.message; // Ambil pesan dari body WhatsAuto
    const reply = await balasPesan(message); // Dapatkan balasan dari fungsi di atas

    // Kirim response balik ke WhatsAuto
    res.status(200).json({
      reply: reply,
    });

  } catch (error) {
    console.error('Error di webhook:', error);
    res.status(500).send('Error internal server.');
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
