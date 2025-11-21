const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { renderTemplate } = require('../utils/templateRenderer');

// Preview website with template
router.get('/preview/:business_id/:template_name', async (req, res) => {
    try {
        const { business_id, template_name } = req.params;
        
        // Fetch business data
        const { data: business, error } = await supabase
            .from('business')
            .select('*')
            .eq('id', business_id)
            .single();
        
        if (error || !business) {
            return res.status(404).json({ error: 'Business not found' });
        }
        
        // Render template with business data
        const html = renderTemplate(template_name, business);
        
        // Send HTML response
        res.send(html);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;