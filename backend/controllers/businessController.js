const supabase = require('../config/supabase');
const { generateAllContent } = require('../utils/aiEnhancer');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads/logos directory if it doesn't exist
const logosDir = path.join(__dirname, '../uploads/logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

const heroDir = path.join(__dirname, '../uploads/hero');
if (!fs.existsSync(heroDir)) {
  fs.mkdirSync(heroDir, { recursive: true });
}

// Configure multer for logo upload
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'hero_image') {
      cb(null, heroDir);
    } else {
      cb(null, logosDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

/**
 * Create Business Controller
 * Creates a new business with optional AI content enhancement and logo upload
 */
const createBusiness = async (req, res) => {
  // Handle file upload first
  uploadLogo(req, res, async (uploadErr) => {
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

      const logo_url = req.files?.logo?.[0]?.filename
        ? `/uploads/logos/${req.files.logo[0].filename}`
        : null;

      const hero_image_url = req.files?.hero_image?.[0]?.filename
        ? `/uploads/hero/${req.files.hero_image[0].filename}`
        : null;

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
        return res.status(400).json({ 
          error: error.message 
        });
      }
      
      console.log('✅ Business created successfully with ID:', data[0].id);
      
      res.status(201).json({ 
        message: 'Business created successfully', 
        business: data[0],
        ai_enhanced: shouldUseAI
      });
      
    } catch (err) {
      console.error('❌ Create business error:', err);
      res.status(500).json({ 
        error: 'Failed to create business' 
      });
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
    
    // Validate ID
    if (!id) {
      return res.status(400).json({ 
        error: 'Business ID is required' 
      });
    }
    
    const { data, error } = await supabase
      .from('business')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return res.status(404).json({ 
        error: 'Business not found' 
      });
    }
    
    res.json(data);
    
  } catch (err) {
    console.error('Get business error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch business' 
    });
  }
};

/**
 * Get All Businesses for User Controller WITH REAL PRODUCT COUNTS
 * Retrieves all businesses belonging to a specific user with real product counts from Supabase
 */
const getBusinessesByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Validate user_id
    if (!user_id) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }
    
    // Get all businesses for user
    const { data: businesses, error: businessError } = await supabase
      .from('business')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    
    if (businessError) {
      console.error('Database error:', businessError);
      return res.status(400).json({ 
        error: businessError.message 
      });
    }

    // If no businesses, return empty array
    if (!businesses || businesses.length === 0) {
      return res.json({
        businesses: [],
        count: 0
      });
    }

    // Get REAL product counts for each business from your products table
    const businessIds = businesses.map(b => b.id);
    
    let productsCount = {};
    
    // Query your actual products table in Supabase
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('business_id')
      .in('business_id', businessIds);

    if (!productsError && products) {
      // Count products per business
      productsCount = products.reduce((acc, product) => {
        acc[product.business_id] = (acc[product.business_id] || 0) + 1;
        return acc;
      }, {});
      
      console.log('✅ Product counts fetched:', productsCount);
    } else {
      console.log('⚠️ No products found or error:', productsError);
    }

    // Add REAL product_count to each business
    const businessesWithCounts = businesses.map(business => ({
      ...business,
      products_count: productsCount[business.id] || 0,
      views: 0 // Placeholder for future view tracking
    }));
    
    console.log(`✅ Returning ${businessesWithCounts.length} businesses with product counts`);
    
    res.json({
      businesses: businessesWithCounts,
      count: businessesWithCounts.length
    });
    
  } catch (err) {
    console.error('❌ Get businesses error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch businesses' 
    });
  }
};

const updateBusiness = async (req, res) => {
  uploadLogo(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ error: uploadErr.message });
    }

    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ 
          error: 'Business ID is required' 
        });
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
        return res.status(404).json({ 
          error: 'Business not found' 
        });
      }

      console.log('📸 Current logo in DB:', currentBusiness.logo_url);
      console.log('🖼️ Current hero in DB:', currentBusiness.hero_image_url);
      const updateData = {};
      const allowedFields = [
        'business_name',
        'industry',
        'tagline',
        'description',
        'services',
        'email',
        'phone',
        'address',
        'linkedin_url',
        'instagram_url',
        'facebook_url',
        'brand_color',
        'template_name'
      ];

      // Add fields from request body
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== 'null') {
          updateData[field] = req.body[field];
        }
      });

      if (req.files?.logo?.[0]) {
        // New logo uploaded
        updateData.logo_url = `/uploads/logos/${req.files.logo[0].filename}`;
        console.log('📸 New logo uploaded:', updateData.logo_url);
      } else {
        // No new logo, keep existing one
        updateData.logo_url = currentBusiness.logo_url;
        console.log('📸 Keeping existing logo:', updateData.logo_url);
      }

      if (req.files?.hero_image?.[0]) {
        // New hero uploaded
        updateData.hero_image_url = `/uploads/hero/${req.files.hero_image[0].filename}`;
        console.log('🖼️ New hero image uploaded:', updateData.hero_image_url);
      } else {
        // No new hero, keep existing one
        updateData.hero_image_url = currentBusiness.hero_image_url;
        console.log('🖼️ Keeping existing hero:', updateData.hero_image_url);
      }

      console.log('💾 Final data to update:', updateData);

      // Update business in database
      const { data, error } = await supabase
        .from('business')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        return res.status(400).json({ 
          error: error.message 
        });
      }

      if (!data) {
        return res.status(404).json({ 
          error: 'Business not found' 
        });
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
      res.status(500).json({ 
        error: 'Failed to update business' 
      });
    }
  });
};

const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res.status(400).json({ 
        error: 'Business ID is required' 
      });
    }

    const { data: business, error: fetchError } = await supabase
      .from('business')
      .select('logo_url, hero_image_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
    }

    // Delete business
    const { error } = await supabase
      .from('business')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return res.status(400).json({ 
        error: error.message 
      });
    }

    if (business) {
      const fs = require('fs');
      const path = require('path');

      // Delete logo file
      if (business.logo_url) {
        try {
          const logoPath = path.join(__dirname, '..', business.logo_url);
          if (fs.existsSync(logoPath)) {
            fs.unlinkSync(logoPath);
            console.log('✅ Deleted logo file:', logoPath);
          }
        } catch (err) {
          console.error('⚠️ Failed to delete logo:', err.message);
        }
      }

      // Delete hero image file
      if (business.hero_image_url) {
        try {
          const heroPath = path.join(__dirname, '..', business.hero_image_url);
          if (fs.existsSync(heroPath)) {
            fs.unlinkSync(heroPath);
            console.log('✅ Deleted hero image:', heroPath);
          }
        } catch (err) {
          console.error('⚠️ Failed to delete hero image:', err.message);
        }
      }
    }

    console.log('✅ Business deleted successfully (including files)');

    res.json({ 
      message: 'Business deleted successfully' 
    });
    
  } catch (err) {
    console.error('Delete business error:', err);
    res.status(500).json({ 
      error: 'Failed to delete business' 
    });
  }
};
 

module.exports = {
  createBusiness,
  getBusinessById,
  getBusinessesByUserId,
  updateBusiness,
  deleteBusiness
};