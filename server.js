const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
require('dotenv').config();

const app = express();
app.use(express.json());

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

async function accessSheet() {
    await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();
}

app.post('/webhook', async (req, res) => {
    try {
        const message = req.body.message; // WhatsAuto mengirim POST dengan JSON { message: "..." }
        
        await accessSheet();
        const sheet = doc.sheetsByIndex[0]; // ambil sheet pertama
        const rows = await sheet.getRows();
        
        // Cari jawaban berdasarkan message
        let reply = 'Maaf, saya tidak mengerti.';
        for (const row of rows) {
            if (row.Question && message.toLowerCase().includes(row.Question.toLowerCase())) {
                reply = row.Answer;
                break;
            }
        }

        res.json({ reply: reply });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

app.get('/', (req, res) => {
    res.send('WhatsApp Bot Server is running 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
