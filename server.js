const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const axios = require('axios');
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
        const message = req.body.message; 
        const sender = req.body.sender;   // ← Tambahan: ambil nomor pengirim
        
        if (!message || !sender) {
            return res.status(400).send('Parameter message atau sender kosong');
        }

        await accessSheet();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();
        
        // Cari jawaban
        let reply = 'Maaf, saya tidak mengerti.';
        for (const row of rows) {
            if (row.Question && message.toLowerCase().includes(row.Question.toLowerCase())) {
                reply = row.Answer;
                break;
            }
        }

        // Kirim balasan ke WhatsAuto
        await axios.post('https://wa.whatsauto.app/api/send', {
            apikey: process.env.WHATSAUTO_API_KEY,
            mobile: sender,
            message: reply
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        res.json({ status: 'Message sent', reply: reply });
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).send('Server Error');
    }
});

app.get('/', (req, res) => {
    res.send('WhatsApp Bot Server is running 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
