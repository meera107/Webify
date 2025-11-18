const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.post('/business', async (req, res) => {
    try {
        const { 
            user_id,
            business_name, 
            industry
        } = req.body;
        
        if (!user_id || !business_name) {
            return res.status(400).json({ 
                error: 'user_id and business_name are required' 
            });
        }
        
        const { data, error } = await supabase
            .from('business')
            .insert([{
                user_id,
                business_name,
                industry
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