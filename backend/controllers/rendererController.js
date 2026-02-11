const supabase = require('../config/supabase');
const { renderTemplate } = require('../utils/renderer.js');
const { generatePDF } = require('../utils/pdfGenerator');

const previewWebsite = async (req, res) => {
  try {
    const { business_id, template_name } = req.params;
    console.log(`🎨 Rendering preview for business: ${business_id}, template: ${template_name}`);

    if (!business_id || !template_name) {
      return res.status(400).json({ 
        error: 'business_id and template_name are required' 
      });
    }
    const { data: business, error } = await supabase
      .from('business')
      .select('*')
      .eq('id', business_id)
      .single();
    
    if (error || !business) {
      return res.status(404).json({ 
        error: 'Business not found' 
      });
    }
    
    console.log('✅ Business data loaded:', business.business_name);

    console.log('📸 Logo URL from DB:', business.logo_url);
    console.log('🖼️ Hero URL from DB:', business.hero_image_url);
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const transformedBusiness = {
      ...business,
      logo_url: business.logo_url ? 
        (business.logo_url.startsWith('http') ? business.logo_url : `${baseUrl}${business.logo_url}`) : 
        null,
      hero_image_url: business.hero_image_url ? 
        (business.hero_image_url.startsWith('http') ? business.hero_image_url : `${baseUrl}${business.hero_image_url}`) : 
        null
    }; 
    
    console.log('✅ Transformed Logo URL:', transformedBusiness.logo_url);
    console.log('✅ Transformed Hero URL:', transformedBusiness.hero_image_url);
    
    const html = renderTemplate(template_name, {
  ...transformedBusiness,
  business_id: business_id 
});
      res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.send(html);
    
  } catch (err) {
    console.error('Preview error:', err);
    res.status(500).json({ 
      error: 'Failed to render preview' 
    });
  }
};

const generateBrochure = async (req, res) => {
  try {
    const { business_id, template_name } = req.params;
    
    console.log(`📄 Generating brochure for business: ${business_id}`);

    if (!business_id || !template_name) {
      return res.status(400).json({ 
        error: 'business_id and template_name are required' 
      });
    }
    const { data: business, error } = await supabase
      .from('business')
      .select('*')
      .eq('id', business_id)
      .single();
    
    if (error || !business) {
      return res.status(404).json({ 
        error: 'Business not found' 
      });
    }
    
    console.log('✅ Business data loaded');
    
    const html = renderTemplate(template_name, business);
    
    const result = await generatePDF(html, business.business_name);
    
    if (result.success) {
      console.log('✅ Brochure generated successfully');
      
      res.json({
        message: 'Brochure generated successfully',
        filename: result.filename,
        download_url: `/api/download/${result.filename}`
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to generate PDF brochure' 
      });
    }
    
  } catch (err) {
    console.error('Brochure generation error:', err);
    res.status(500).json({ 
      error: 'Failed to generate brochure' 
    });
  }
};

const generateCatalog = async (req, res) => {
  try {
    const { business_id } = req.params;
    
    console.log(`📋 Generating catalog for business: ${business_id}`);
    
    if (!business_id) {
      return res.status(400).json({ 
        error: 'business_id is required' 
      });
    }
    
    const { data: business, error: businessError } = await supabase
      .from('business')
      .select('*')
      .eq('id', business_id)
      .single();
    
    if (businessError || !business) {
      return res.status(404).json({ 
        error: 'Business not found' 
      });
    }
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', business_id)
      .order('category', { ascending: true });
    
    if (productsError) {
      console.error('Products fetch error:', productsError);
      return res.status(400).json({ 
        error: productsError.message 
      });
    }
    
    if (!products || products.length === 0) {
      return res.status(404).json({ 
        error: 'No products found for this business' 
      });
    }
    
    console.log(`✅ Found ${products.length} products`);
    
    const catalogData = {
      ...business,
      products: products
    };
    const html = renderTemplate('catalog', catalogData);
    
    const result = await generatePDF(html, `${business.business_name}_catalog`);
    
    if (result.success) {
      console.log('✅ Catalog generated successfully');
      
      res.json({
        message: 'Catalog generated successfully',
        filename: result.filename,
        download_url: `/api/download/${result.filename}`,
        products_count: products.length
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to generate catalog PDF' 
      });
    }
    
  } catch (err) {
    console.error('Catalog generation error:', err);
    res.status(500).json({ 
      error: 'Failed to generate catalog' 
    });
  }
};

const downloadPDF = (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ 
        error: 'Filename is required' 
      });
    }
    
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: 'File not found' 
      });
    }
    
    console.log('📥 Downloading file:', filename);
    
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ 
            error: 'Download failed' 
          });
        }
      }
    });
    
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ 
      error: 'Failed to download file' 
    });
  }
};

const getTemplates = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: error.message 
      });
    }

    res.json({
      templates: data || [],
      count: data ? data.length : 0
    });
    
  } catch (err) {
    console.error('Get templates error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch templates' 
    });
  }
};

module.exports = {
  previewWebsite,
  generateBrochure,
  generateCatalog,
  downloadPDF,
  getTemplates
};