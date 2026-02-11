const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ======================================================
   SAFE AI CALL (NEVER THROWS)
====================================================== */
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
    return null; // NEVER throw (important)
  }
};

/* ======================================================
   1. HERO DESCRIPTION
====================================================== */
const enhanceDescription = async (businessName, industry, shortDescription) => {
  const prompt = `
You are a senior brand copywriter.

Rewrite this into a concise, premium business description.

Business: ${businessName}
Industry: ${industry}
Input: ${shortDescription}

Rules:
- 25–45 words max
- Professional but catchy
- Strong value proposition
- Avoid generic phrases
Return ONLY the description.
`;

  const text = await callAI(prompt);

  if (!text) return shortDescription;

  return text;
};

/* ======================================================
   2. TAGLINE
====================================================== */
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

/* ======================================================
   3. HERO PILLS
====================================================== */
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

/* ======================================================
   4. ABOUT SECTION
====================================================== */
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

/* ======================================================
   5. SERVICES ENHANCER
====================================================== */
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

/* ======================================================
   6. UNIVERSAL STATS (NO NUMBERS)
====================================================== */
const generateStats = async () => {
  return [
    { title: "Trusted", subtitle: "Clients" },
    { title: "Proven", subtitle: "Results" },
    { title: "Quality", subtitle: "Driven" }
  ];
};

/* ======================================================
   MASTER GENERATOR (SAFE — NO Promise.all)
====================================================== */
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

/* ======================================================
   EXPORTS
====================================================== */
module.exports = {
  enhanceDescription,
  generateTagline,
  generatePills,
  generateAbout,
  enhanceServices,
  generateStats,
  generateAllContent
};
