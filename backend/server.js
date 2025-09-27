import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Match your Python endpoint structure
app.post('/api/chat/message', async (req, res) => {
  try {
    const { message, type = 'general' } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: message }],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      return res.status(response.status).json({ 
        response: "API error occurred.",
        type: type,
        provider: 'groq_error'
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No reply returned.";
    
    res.json({ 
      response: reply,
      type: type,
      provider: 'groq'
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Sorry, something went wrong." });
  }
});

// Functions endpoint to match Python
app.get('/api/chat/functions', (req, res) => {
  res.json({
    functions: [
      {'id': 'news', 'name': 'News Assistant', 'description': 'Get latest news and updates'},
      {'id': 'health', 'name': 'Healthcare & Well-being', 'description': 'Health advice and wellness tips'},
      {'id': 'ecommerce', 'name': 'E-commerce', 'description': 'Shopping assistance and product recommendations'},
      {'id': 'travel', 'name': 'Travel & Hospitality', 'description': 'Travel planning and booking help'}
    ]
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Node.js server running on port ${PORT}`));