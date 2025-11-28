const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const {renderTemplate} = require('../utils/renderer.js');
const puppeteer = require('puppeteer');
const {generatePDF} = require('../utils/pdfGenerator');

// Preview website with template
router.get('/preview/:business_id/:template_name', async (req, res) => {
    try {
        const { business_id, template_name } = req.params;
        
        // Fetch business data
        const { data: business, error } = await supabase
            .from('business')
            .select('*')
            .eq('id', business_id)
            .single()
        
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

// Generate PDF brochure
router.post('/generate-brochure/:business_id/:template_name', async (req, res) => {
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
        
        // Generate PDF
        const result = await generatePDF(html, business.business_name);
        
        if (result.success) {
            res.json({
                message: 'Brochure generated successfully',
                filename: result.filename,
                download_url: `/api/download/${result.filename}`
            });
        } else {
            res.status(500).json({ error: 'Failed to generate PDF' });
        }
        
    } catch (err) {
        console.error('Brochure generation error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Download PDF
router.get('/download/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = require('path').join(__dirname, '../uploads', filename);
        
        // Check if file exists
        if (!require('fs').existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        // Set headers for download
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).json({ error: 'Download failed' });
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generate Product Catalog PDF
router.post('/generate-catalog/:business_id', async (req, res) => {
    try {
        const { business_id } = req.params;
        
        // Fetch business data
        const { data: business, error: businessError } = await supabase
            .from('business')
            .select('*')
            .eq('id', business_id)
            .single();
        
        if (businessError || !business) {
            return res.status(404).json({ error: 'Business not found' });
        }
        
        // Fetch products for this business
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('business_id', business_id)
            .order('category', { ascending: true });
        
        if (productsError) {
            return res.status(400).json({ error: productsError.message });
        }
        
        if (!products || products.length === 0) {
            return res.status(404).json({ error: 'No products found for this business' });
        }
        
        // Combine business and products data
        const catalogData = {
            ...business,
            products: products
        };
        
        // Render catalog template
        const html = renderTemplate('catalog', catalogData);
        
        // Generate PDF
        const result = await generatePDF(html, `${business.business_name}_catalog`);
        
        if (result.success) {
            res.json({
                message: 'Catalog generated successfully',
                filename: result.filename,
                download_url: `/api/download/${result.filename}`,
                products_count: products.length
            });
        } else {
            res.status(500).json({ error: 'Failed to generate catalog PDF' });
        }
        
    } catch (err) {
        console.error('Catalog generation error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;