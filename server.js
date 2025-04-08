const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // WAJIB: untuk parsing JSON dari WhatsAuto

app.post('/webhook', (req, res) => {
    const data = req.body;
    console.log('Data diterima dari WhatsAuto:', data);
    
    // Balas respons ke WhatsAuto (wajib kasih respons 200 OK)
    res.status(200).json({ reply: "Halo, saya bot!" });
});

app.get('/', (req, res) => {
    res.send('Server WhatsApp Bot Jalan 🚀');
});

app.listen(PORT, () => {
    console.log(`Server running di port ${PORT}`);
});
