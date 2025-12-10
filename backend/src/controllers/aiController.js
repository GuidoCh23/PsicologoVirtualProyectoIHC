export const chat = async (req, res) => {
    try {
        const { messages } = req.body;
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'AI API key not configured' });
        }
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.7,
                max_tokens: 300
            })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Error from Groq API');
        }
        const data = await response.json();
        const content = data.choices[0].message.content;
        res.json({ content });
    }
    catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ message: error.message || 'Error processing AI request' });
    }
};
//# sourceMappingURL=aiController.js.map