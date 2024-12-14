const express = require('express');
const { PythonShell } = require('python-shell');
const fileUpload = require('express-fileupload');

const app = express();
app.use(express.json());
app.use(fileUpload());

// Endpoint لتحليل النصوص والصور معًا
app.post('/analyze', async (req, res) => {
    const { text } = req.body;
    const image = req.files?.image;

    if (!text && !image) {
        return res.status(400).json({ error: "Text or image is required." });
    }

    const textPromise = text
        ? new Promise((resolve, reject) => {
              PythonShell.run('analyze_text.py', { args: [text] }, (err, results) => {
                  if (err) return reject(err.message);
                  resolve(JSON.parse(results[0]));
              });
          })
        : Promise.resolve(null);

    const imagePromise = image
        ? new Promise((resolve, reject) => {
              const imagePath = `uploads/${Date.now()}-${image.name}`;
              image.mv(imagePath, (err) => {
                  if (err) return reject(err.message);
                  PythonShell.run('medical_ai_api.py', { args: [imagePath] }, (err, results) => {
                      if (err) return reject(err.message);
                      resolve(JSON.parse(results[0]));
                  });
              });
          })
        : Promise.resolve(null);

    try {
        const [textAnalysis, imageAnalysis] = await Promise.all([textPromise, imagePromise]);
        const relationships = analyzeRelationships(textAnalysis, imageAnalysis);
        res.json({ textAnalysis, imageAnalysis, relationships });
    } catch (error) {
        res.status(500).json({ error });
    }
});

function analyzeRelationships(textAnalysis, imageAnalysis) {
    if (!textAnalysis || !imageAnalysis) return null;

    const matches = [];
    textAnalysis.keywords.forEach((keyword) => {
        if (imageAnalysis.diagnosis.includes(keyword)) {
            matches.push(`Keyword "${keyword}" matches with image diagnosis.`);
        }
    });

    return {
        matches,
        matchedCount: matches.length
    };
}

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
