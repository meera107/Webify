require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // ← NEW: Serve uploaded images

// Routes
app.use('/api', require('./routes/templatesRoute'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/businessRoutes'));
app.use('/api', require('./routes/generatorRoutes'));
app.use('/api', require('./routes/productRoutes')); // ← ALREADY ADDED

app.get('/', (req, res) => {
    res.send('Webify Backend is running!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});