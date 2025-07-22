const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// Create the temp directory if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;
const { startSpamming } = require('./spam-logic'); // Import the spamming logic

let server = require('./eliahqr');
require('events').EventEmitter.defaultMaxListeners = 500;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/eliahqr', server);
app.use('/eliahpcode', require('./eliahpcode'));
app.get('/pair', (req, res) => {
  res.redirect('/eliahpcode');
});
app.get('/code', (req, res) => {
  const number = req.query.number;
  if (!number) return res.redirect('/eliahpcode');
  res.redirect(`/eliahpcode/code?number=${encodeURIComponent(number)}`);
});
app.use('/spam-pair', async (req, res, next) => {
  res.sendFile(path.join(__dirname, 'spam-pair.html'));
});
app.get('/api/spam-pair', async (req, res) => {
  const number = req.query.number;
  const count = parseInt(req.query.count) || 15; // Get count or default to 15

  if (!number || number.length < 11) {
    return res.status(400).json({ message: 'Invalid WhatsApp number provided.' });
  }

  // Immediately respond to the user
  res.json({ message: `Bulk pairing process with ${count} requests initiated for +${number}.` });

  // Run the spamming process in the background
  startSpamming(number, count).catch(err => {
    console.error(`[SPAM-FATAL] A critical error occurred during the spam attack on ${number}:`, err);
  });
});
app.use('/', async (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, 'eliahpage.html'));
  } catch (err) {
    res.status(404).send('eliahpage.html not found');
  }
});
app.listen(PORT, () => {
    console.log(`
Don't Forget To Give Star

 Server running on http://localhost:` + PORT)
})

module.exports = app
/**
    powered by EliTechWiz team 
    join Whatsapp channel for more updates 
    **/
