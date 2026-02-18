require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const callAI = async (prompt, max_tokens = 150, temperature = 0.7) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens,
      temperature
    });

    return response.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.log("❌ OpenAI Error:", err.message);
    return null; 
  }
};

const enhanceDescription = async (businessName, industry, shortDescription) => {
  console.log('🔍 Enhancing description...');
  console.log('   Original:', shortDescription);
  
  const prompt = `
You are an expert copywriter.

COMPLETELY REWRITE this business description to sound professional and engaging.

Business: ${businessName}
Industry: ${industry}
Current text: "${shortDescription}"

Requirements:
- 30-50 words
- Professional and engaging tone
- Focus on benefits for customers
- Make it sound premium

Example:
Input: "sell different customized size of diamond"
Output: "Discover exquisite diamonds tailored to your exact vision. We specialize in custom-crafted pieces in every size, transforming your dream jewelry into stunning reality with exceptional quality and personalized service."

Now rewrite the text above:
`;

  const text = await callAI(prompt, 200, 0.8);

  if (!text) {
    console.log('   ❌ AI failed');
    return shortDescription;
  }

  console.log('   ✅ Enhanced:', text);
  return text;
};

const generateTagline = async (businessName, industry) => {
  const prompt = `
Create a catchy, professional tagline.

Business: ${businessName}
Industry: ${industry}

Rules:
- 4–8 words
- Premium brand feel
- No punctuation

Return only the tagline.
`;

  const text = await callAI(prompt, 40, 0.9);

  if (!text) return `Trusted ${industry} Experts`;

  return text.replace(/['"]/g, '');
};

const generatePills = async (businessName, industry) => {
  const prompt = `
Create 3 short, modern highlight phrases.

Business: ${businessName}
Industry: ${industry}

Rules:
- 2–3 words each
- Works for ANY industry

Return ONLY JSON:
["Phrase 1","Phrase 2","Phrase 3"]
`;

  const text = await callAI(prompt, 60, 0.9);

  if (!text) {
    return ["Simply Better", "Trusted Service", "Built Right"];
  }

  try {
    return JSON.parse(text);
  } catch {
    return ["Simply Better", "Trusted Service", "Built Right"];
  }
};

const generateAbout = async (businessName, industry) => {
  const prompt = `
Write a professional About Us paragraph.

Business: ${businessName}
Industry: ${industry}

Rules:
- 2–3 sentences
- Trust building
- Professional tone
- Not salesy
Return only paragraph.
`;

  const text = await callAI(prompt, 120, 0.7);

  if (!text) {
    return `${businessName} delivers dependable ${industry} solutions with professionalism, consistency, and attention to detail. Our focus is long-term relationships built on trust, quality, and reliable service.`;
  }

  return text;
};

const enhanceServices = async (services = [], industry) => {
  if (!services.length) return [];

  const prompt = `
Industry: ${industry}
Services: ${services.join(', ')}

For each service:
Write a benefit-driven description (12–18 words)

Return ONLY JSON:
[
  {"name":"Service","description":"Text"}
]
`;

  const text = await callAI(prompt, 350, 0.7);

  if (!text) {
    return services.map(s => ({
      name: s,
      description: "Professional, reliable service tailored to your specific business needs."
    }));
  }

  try {
    return JSON.parse(text);
  } catch {
    return services.map(s => ({
      name: s,
      description: "Professional, reliable service tailored to your specific business needs."
    }));
  }
};

const generateStats = async () => {
  return [
    { title: "Trusted", subtitle: "Clients" },
    { title: "Proven", subtitle: "Results" },
    { title: "Quality", subtitle: "Driven" }
  ];
};

const generateAllContent = async ({
  businessName,
  industry,
  description,
  services = []
}) => {
  const heroDescription = await enhanceDescription(
    businessName,
    industry,
    description
  );

  const tagline = await generateTagline(businessName, industry);

  const pills = await generatePills(businessName, industry);

  const about = await generateAbout(businessName, industry);

  const enhancedServices = await enhanceServices(services, industry);

  const stats = await generateStats();

  return {
    heroDescription,
    tagline,
    pills,
    about,
    services: enhancedServices,
    stats
  };
};

module.exports = {
  enhanceDescription,
  generateTagline,
  generatePills,
  generateAbout,
  enhanceServices,
  generateStats,
  generateAllContent
};
