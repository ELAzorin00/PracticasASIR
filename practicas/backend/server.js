const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

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

    const outputFileName = `output.txt`;
    fs.writeFileSync(outputFileName, extractedText, 'utf-8');
    console.log(`✅ Texto guardado en ${outputFileName}`);

    const respuestaIA = `✅ Simulación IA para "${file.originalname}":\nPrompt: "${prompt}"\n\nTexto extraído (500 chars):\n${extractedText.slice(0, 500)}\n---`;

    res.json({
      nombreArchivo: file.originalname,
      output: outputFileName,
      respuesta: respuestaIA
    });
  } catch (error) {
    console.error('❌ Error al procesar archivo:', error);
    res.status(500).json({ error: 'Error al procesar el archivo.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});