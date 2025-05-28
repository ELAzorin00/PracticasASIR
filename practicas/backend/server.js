const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No se recibió archivo.' });
    }

    const pdfBuffer = file.buffer;
    const data = await pdfParse(pdfBuffer);
    const extractedText = data.text;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Eres un asistente útil que analiza documentos PDF.' },
        { role: 'user', content: `${prompt}\n\nTexto del PDF:\n${extractedText.slice(0, 3000)}` }
      ],
      temperature: 0.7,
    });

    const respuestaIA = completion.choices[0].message.content;

    res.json({
      nombreArchivo: file.originalname,
      respuesta: respuestaIA
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Error al procesar el archivo o generar respuesta IA.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});