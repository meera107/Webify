require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log("SUPABASE KEY USED (first 20 chars):", supabaseKey?.slice(0, 20));


if(!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key is not defined in environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;