const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Enhance business description using AI
 * Takes short/basic description and returns professional, detailed version
 */
const enhanceDescription = async (businessName, industry, shortDescription) => {
    try {
        const prompt = `You are a professional copywriter. 
        
Business Name: ${businessName}
Industry: ${industry}
Current Description: ${shortDescription}

Write a professional, engaging business description (2-3 paragraphs, ~150 words) that:
- Sounds professional and trustworthy
- Highlights expertise in ${industry}
- Emphasizes value proposition
- Uses compelling language
- Is suitable for a business website

Only return the enhanced description, nothing else.`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300,
            temperature: 0.7
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('AI Enhancement Error:', error.message);
        // Return original if AI fails
        return shortDescription;
    }
};

/**
 * Generate professional tagline using AI
 */
const generateTagline = async (businessName, industry, description) => {
    try {
        const prompt = `Create a professional, catchy tagline for this business:

Business Name: ${businessName}
Industry: ${industry}
Description: ${description}

Requirements:
- 5-10 words maximum
- Memorable and impactful
- Reflects the business value
- Professional tone

Only return the tagline, nothing else.`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 50,
            temperature: 0.8
        });

        return response.choices[0].message.content.trim().replace(/['"]/g, '');
    } catch (error) {
        console.error('Tagline Generation Error:', error.message);
        return `Leading ${industry} Solutions`;
    }
};

/**
 * Enhance services list with descriptions
 */
const enhanceServices = async (services, industry) => {
    try {
        const prompt = `You are a professional copywriter. Enhance these service names with brief descriptions:

Services: ${services.join(', ')}
Industry: ${industry}

For each service, write a one-sentence description (15-20 words) that explains the value.

Return ONLY a JSON array in this exact format:
[
  {"name": "Service 1", "description": "Brief description here"},
  {"name": "Service 2", "description": "Brief description here"}
]

Do not include any other text, just the JSON array.`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 400,
            temperature: 0.7
        });

        const content = response.choices[0].message.content.trim();
        // Parse JSON response
        const enhancedServices = JSON.parse(content);
        return enhancedServices;
    } catch (error) {
        console.error('Services Enhancement Error:', error.message);
        // Return original services as simple array
        return services.map(service => ({ name: service, description: '' }));
    }
};

module.exports = {
    enhanceDescription,
    generateTagline,
    enhanceServices
};