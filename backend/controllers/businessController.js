const supabase = require('../config/supabase');
const { supabaseAdmin } = require('../config/supabase');
const { generateAllContent } = require('../utils/aiEnhancer');
const multer = require('multer');
const path = require('path');

// Use memory storage instead of disk storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'hero_image', maxCount: 1 }
]);

// Helper to upload image to Supabase Storage
const uploadToSupabase = async (file, folder) => {
  const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
  const filePath = `${folder}/${filename}`;

  const { error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Create Business Controller
 * Creates a new business with optional AI content enhancement and logo upload
 */
const createBusiness = async (req, res) => {
  upload(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ error: uploadErr.message });
    }

    try {
      const { 
        user_id,
        business_name,
        industry,
        tagline,
        description,
        services,
        email,
        phone,
        address,
        linkedin_url,
        instagram_url,
        facebook_url,
        brand_color,
        template_name,
        use_ai
      } = req.body;
      
      const shouldUseAI = use_ai === 'true' || use_ai === true; 

      let logo_url = null;
      let hero_image_url = null;

      if (req.files?.logo?.[0]) {
        logo_url = await uploadToSupabase(req.files.logo[0], 'logos');
      }
      if (req.files?.hero_image?.[0]) {
        hero_image_url = await uploadToSupabase(req.files.hero_image[0], 'hero');
      }

      console.log('📸 LOGO:', logo_url);
      console.log('🖼️  HERO:', hero_image_url);

      // Validation
      if (!user_id || !business_name) {
        return res.status(400).json({ 
          error: 'user_id and business_name are required' 
        });
      }

      let servicesArray;
      try {
        servicesArray = typeof services === 'string' ? JSON.parse(services) : services;
      } catch (e) {
        console.log("⚠️ Services JSON parsing failed, attempting comma-split");
        servicesArray = typeof services === 'string' 
          ? services.split(',').map(s => s.trim()).filter(Boolean)
          : services;
      }

      // Initialize final values 
      let finalDescription = description || `Professional ${industry} services`;
      let finalTagline = tagline || `Quality ${industry} You Can Trust`;
      let finalServices = servicesArray || [];
      let aiAbout = null;
      let aiPills = null;
      let aiStats = null;

      if (shouldUseAI) {
        try {
          console.log('🤖 Starting AI content generation...');
          
          const aiContent = await generateAllContent({
            businessName: business_name,
            industry,
            description: description || `We are a ${industry} business`,
            services: servicesArray || [],
            context: `You are a content generator for a business website. 
            Generate content specifically for a ${industry} business. 
            Provide the following:
            - tagline (hero section)
            - heroDescription
            - about text
            - 3-6 feature pills
            - 3 services with name and description
            Make it fully relevant to the ${industry} and engaging for users.`
          });

          console.log("✅ AI Content Generated Successfully:");
          console.log("  📝 Tagline:", aiContent.tagline);
          console.log("  📄 Hero Description:", aiContent.heroDescription);
          console.log("  ℹ️  About:", aiContent.about);
          console.log("  🏷️  Pills:", aiContent.pills);
          console.log("  🛠️  Services:", aiContent.services);
          console.log("  📊 Stats:", aiContent.stats);

          finalTagline = aiContent.tagline || finalTagline;
          finalDescription = aiContent.heroDescription || finalDescription;
          aiAbout = aiContent.about;
          aiPills = aiContent.pills;
          aiStats = aiContent.stats;
          
          if (aiContent.services && aiContent.services.length > 0) {
            finalServices = aiContent.services;
          }

        } catch (err) {
          console.log("❌ AI content generation failed:", err.message);
          console.log("⚠️  Proceeding with manual content");
        }
      }

      aiAbout = aiAbout || description || `${business_name} delivers exceptional ${industry} services with professionalism and dedication.`;
      aiPills = aiPills || ["Trusted", "Professional", "Reliable"];

      if (finalServices && finalServices.length > 0) {
        finalServices = finalServices.map(service => {
          if (typeof service === 'string') {
            return {
              name: service,
              description: `Professional ${service.toLowerCase()} services tailored to your needs.`
            };
          }
          return service;
        });
      }

      console.log("💾 FINAL VALUES BEING SAVED:");
      console.log("  Tagline:", finalTagline);
      console.log("  Description:", finalDescription);
      console.log("  About:", aiAbout);
      console.log("  Pills:", aiPills);
      console.log("  Services:", JSON.stringify(finalServices, null, 2));
      console.log("  Stats:", aiStats);

      // Insert business into database
      const { data, error } = await supabase
        .from('business')
        .insert([{
          user_id,
          business_name,
          industry,
          tagline: finalTagline,
          description: finalDescription,
          services: finalServices,
          ai_about: aiAbout,
          ai_pills: aiPills,
          ai_stats: aiStats,
          email,
          phone,
          address,
          linkedin_url,
          instagram_url,
          facebook_url,
          logo_url,
          hero_image_url,
          brand_color: brand_color || '#667eea',
          template_name: template_name || 'modern'
        }])
        .select();
      
      if (error) {
        console.error('❌ Database error:', error);
        return res.status(400).json({ error: error.message });
      }
      
      console.log('✅ Business created successfully with ID:', data[0].id);
      
      res.status(201).json({ 
        message: 'Business created successfully', 
        business: data[0],
        ai_enhanced: shouldUseAI
      });
      
    } catch (err) {
      console.error('❌ Create business error:', err);
      res.status(500).json({ error: 'Failed to create business' });
    }
  });
};

/**
 * Get Business by ID Controller
 * Retrieves a single business by its ID
 */
const getBusinessById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Business ID is required' });
    }
    
    const { data, error } = await supabase
      .from('business')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    res.json(data);
    
  } catch (err) {
    console.error('Get business error:', err);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
};

/**
 * Get All Businesses for User Controller WITH REAL PRODUCT COUNTS
 * Retrieves all businesses belonging to a specific user with real product counts from Supabase
 */
const getBusinessesByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const { data: businesses, error: businessError } = await supabase
      .from('business')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    
    if (businessError) {
      console.error('Database error:', businessError);
      return res.status(400).json({ error: businessError.message });
    }

    if (!businesses || businesses.length === 0) {
      return res.json({ businesses: [], count: 0 });
    }

    const businessIds = businesses.map(b => b.id);
    
    let productsCount = {};
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('business_id')
      .in('business_id', businessIds);

    if (!productsError && products) {
      productsCount = products.reduce((acc, product) => {
        acc[product.business_id] = (acc[product.business_id] || 0) + 1;
        return acc;
      }, {});
      console.log('✅ Product counts fetched:', productsCount);
    } else {
      console.log('⚠️ No products found or error:', productsError);
    }

    const businessesWithCounts = businesses.map(business => ({
      ...business,
      products_count: productsCount[business.id] || 0,
      views: 0
    }));
    
    console.log(`✅ Returning ${businessesWithCounts.length} businesses with product counts`);
    
    res.json({
      businesses: businessesWithCounts,
      count: businessesWithCounts.length
    });
    
  } catch (err) {
    console.error('❌ Get businesses error:', err);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
};

const updateBusiness = async (req, res) => {
  upload(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ error: uploadErr.message });
    }

    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'Business ID is required' });
      }

      console.log('📝 Updating business:', id);
      console.log('📦 Request body keys:', Object.keys(req.body));
      console.log('📁 Files received:', req.files);

      const { data: currentBusiness, error: fetchError } = await supabase
        .from('business')
        .select('logo_url, hero_image_url')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        return res.status(404).json({ error: 'Business not found' });
      }

      console.log('📸 Current logo in DB:', currentBusiness.logo_url);
      console.log('🖼️ Current hero in DB:', currentBusiness.hero_image_url);

      const updateData = {};
      const allowedFields = [
        'business_name', 'industry', 'tagline', 'description',
        'services', 'email', 'phone', 'address',
        'linkedin_url', 'instagram_url', 'facebook_url',
        'brand_color', 'template_name'
      ];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== 'null') {
          updateData[field] = req.body[field];
        }
      });

      if (req.files?.logo?.[0]) {
        updateData.logo_url = await uploadToSupabase(req.files.logo[0], 'logos');
        console.log('📸 New logo uploaded to Supabase:', updateData.logo_url);
      } else {
        updateData.logo_url = currentBusiness.logo_url;
        console.log('📸 Keeping existing logo:', updateData.logo_url);
      }

      if (req.files?.hero_image?.[0]) {
        updateData.hero_image_url = await uploadToSupabase(req.files.hero_image[0], 'hero');
        console.log('🖼️ New hero image uploaded to Supabase:', updateData.hero_image_url);
      } else {
        updateData.hero_image_url = currentBusiness.hero_image_url;
        console.log('🖼️ Keeping existing hero:', updateData.hero_image_url);
      }

      console.log('💾 Final data to update:', updateData);

      const { data, error } = await supabase
        .from('business')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        return res.status(400).json({ error: error.message });
      }

      if (!data) {
        return res.status(404).json({ error: 'Business not found' });
      }

      console.log('✅ Business updated successfully');
      console.log('📸 Final logo_url in DB:', data.logo_url);
      console.log('🖼️ Final hero_image_url in DB:', data.hero_image_url);

      res.json({
        message: 'Business updated successfully',
        business: data
      });
      
    } catch (err) {
      console.error('❌ Update business error:', err);
      res.status(500).json({ error: 'Failed to update business' });
    }
  });
};

const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    const { data: business, error: fetchError } = await supabase
      .from('business')
      .select('logo_url, hero_image_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
    }

    const { error } = await supabase
      .from('business')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('✅ Business deleted successfully');
    res.json({ message: 'Business deleted successfully' });
    
  } catch (err) {
    console.error('Delete business error:', err);
    res.status(500).json({ error: 'Failed to delete business' });
  }
};

module.exports = {
  createBusiness,
  getBusinessById,
  getBusinessesByUserId,
  updateBusiness,
  deleteBusiness
};