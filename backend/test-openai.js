require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function testOpenAI() {
    try {
        console.log('Testing OpenAI connection...');
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Say hello!" }],
            max_tokens: 10
        });
        
        console.log('✅ SUCCESS!');
        console.log('Response:', response.choices[0].message.content);
    } catch (error) {
        console.log('❌ ERROR:', error.message);
    }
}

testOpenAI();