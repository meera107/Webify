const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { enhanceDescription, generateTagline, enhanceServices } = require('../utils/aiEnhancer');

// Submit business information
router.post('/business', async (req, res) => {
    try {
        const { 
            user_id,
            business_name,
            industry,
            tagline,
            description,
            services,
            contact_email,
            contact_number,
            address,
            linkedin_url,
            instagram_url,
            facebook_url,
            logo_url,
            brand_color,
            use_ai = true
        } = req.body;
        
        // Validate required fields
        if (!user_id || !business_name) {
            return res.status(400).json({ 
                error: 'user_id and business_name are required' 
            });
        }

        let finalDescription = description;
        let finalTagline = tagline;
        let finalServices = services;

          if (use_ai) {
            console.log('🤖 AI Enhancement started...');

            // Enhance description if provided
            if (description && description.length < 200) {
                console.log('Enhancing description...');
                finalDescription = await enhanceDescription(
                    business_name, 
                    industry, 
                    description
                );
            }

            // Generate tagline if not provided
            if (!tagline) {
                console.log('Generating tagline...');
                finalTagline = await generateTagline(
                    business_name, 
                    industry, 
                    finalDescription || description
                );
            }

            // Enhance services if provided
            if (services && Array.isArray(services) && services.length > 0) {
                console.log('Enhancing services...');
                finalServices = await enhanceServices(services, industry);
            }

            console.log('✅ AI Enhancement complete!');
            console.log('Final tagline:', finalTagline);
            console.log('Final description:', finalDescription);
            console.log('Final services:', finalServices);
        }
        
        const { data, error } = await supabase
            .from('business')
            .insert([{
                user_id: user_id,
                business_name: business_name,
                industry: industry,
                tagline: finalTagline,
                description: finalDescription,
                services: finalServices,
                email: contact_email,
                phone: contact_number,
                address: address,
                linkedin_url: linkedin_url,
                instagram_url: instagram_url,
                facebook_url: facebook_url,
                logo_url: logo_url,
                brand_color: brand_color || '#667eea'
            }])
            .select();
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        res.json({ 
            message: 'Business created successfully', 
            business: data[0] 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get business by ID
router.get('/business/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('business')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            return res.status(404).json({ error: 'Business not found' });
        }
        
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all businesses for a user
router.get('/business/user/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        
        const { data, error } = await supabase
            .from('business')
            .select('*')
            .eq('user_id', user_id);
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;