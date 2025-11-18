const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        res.json({ message: 'Signup successful', user: data.user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        res.json({ message: 'Login successful', 
            user: data.user,
            session: data.session,
            accessToken: data.session.access_token
         });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;