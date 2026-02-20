require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path'); // ADD THIS LINE

const app = express();

// Middleware - CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
  'https://webify-z52f.vercel.app',  
  'https://webify-jet.vercel.app',   
];
    
    // Allow localhost and any local IP
    if (origin.startsWith('http://localhost:') || 
        origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/) ||
        origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:\d+$/)||
    allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // CHANGE THIS LINE

// Routes
app.use('/api/templates', require('./routes/templatesRoute'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/businesses', require('./routes/businessRoutes'));
app.use('/api', require('./routes/rendererRoutes'));
app.use('/api/products', require('./routes/productRoutes')); 

app.get('/', (req, res) => {
    res.send('Webify Backend is running!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://192.168.1.6:${PORT}`);
});