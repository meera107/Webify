const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const upload = require('../config/upload');

// Upload product image
router.post('/upload-image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }
        
        const imageUrl = `/uploads/${req.file.filename}`;
        
        res.json({
            message: 'Image uploaded successfully',
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create product
router.post('/products', async (req, res) => {
    try {
        console.log('=== POST /products called ===');
        console.log('Received body:', req.body);

        const {
            business_id,
            product_name,
            description,
            price,
            image_url,
            category
        } = req.body;
        
        // Validate required fields
        if (!business_id || !product_name) {
            return res.status(400).json({
                error: 'business_id and product_name are required'
            });
        }
        
        const { data, error } = await supabase
            .from('products')
            .insert([{
                business_id: business_id,
                product_name: product_name,
                description: description,
                price: price,
                image_url: image_url,
                category: category
            }])
            .select();
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        res.json({
            message: 'Product created successfully',
            product: data[0]
        });
    } catch (err) {
        console.error('=== ERROR in POST /products ===');
        console.error('Error details:', err);

        res.status(500).json({ error: err.message });
    }
});

// Get all products for a business
router.get('/products/business/:business_id', async (req, res) => {
    try {
        const { business_id } = req.params;
        
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('business_id', business_id)
            .order('created_at', { ascending: false });
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single product
router.get('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update product
router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            product_name,
            description,
            price,
            image_url,
            category
        } = req.body;
        
        const { data, error } = await supabase
            .from('products')
            .update({
                product_name: product_name,
                description: description,
                price: price,
                image_url: image_url,
                category: category
            })
            .eq('id', id)
            .select();
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        res.json({
            message: 'Product updated successfully',
            product: data[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;