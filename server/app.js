require('dotenv').config({ path: '.env.example' });
const express = require('express');
const OpenAI = require('openai');

const app = express();
const port = 3009;

app.use(express.json());

// Allow requests from the Chrome extension
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /generate-soap
// Body: { subjective, objective, assessment, plan }
// Returns: { subjective, objective, assessment, plan }
app.post('/generate-soap', async (req, res) => {
    console.log('[Server] req.body:', JSON.stringify(req.body, null, 2));

    const { subjective, objective, assessment, plan } = req.body;

    if (!subjective && !objective && !assessment && !plan) {
        return res.status(400).json({ error: 'At least one SOAP field is required.' });
    }

    console.log('[Server] Received SOAP fields:');
    console.log('  Subjective:', subjective);
    console.log('  Objective:', objective);
    console.log('  Assessment:', assessment);
    console.log('  Plan:', plan);

    const doctorComments = 'The patient has shown approximately 10% improvement since the last session.';

    const prompt = `
You are a physiotherapy assistant. Rewrite the SOAP note below based on the doctor's comments.
Use simple, clear language. Keep it concise. Return ONLY a valid JSON object with keys: subjective, objective, assessment, plan.

Doctor's comments: ${doctorComments}

Current SOAP note:
Subjective: ${subjective || 'N/A'}
Objective: ${objective || 'N/A'}
Assessment: ${assessment || 'N/A'}
Plan: ${plan || 'N/A'}

Return JSON only, no extra text.
`.trim();

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
    });

    const raw = JSON.parse(completion.choices[0].message.content);

    // Normalize all keys to lowercase so the extension can reliably destructure them
    const result = Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k.toLowerCase(), v])
    );

    console.log('[Server] Generated SOAP:', result);
    res.json(result);
});

app.listen(port, () => {
    console.log(`AI Notes for Jane server running at http://localhost:${port}`);
});
