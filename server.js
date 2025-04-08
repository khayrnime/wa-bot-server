app.post('/message.php', async (req, res) => {
  const body = req.body;

  console.log("Pesan masuk dari WhatsAuto:", body);

  const message = body.message || body.text || 'Tidak ada pesan';

  // Contoh balasan sederhana
  res.json({
    reply: `Halo! Kamu mengirim: ${message}`
  });
});
