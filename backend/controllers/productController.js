const supabase = require('../config/supabase');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

const uploadMiddleware = upload.array('images', 5);

/**
 * Create Product Controller
 * Creates a new product with optional image upload
 */
const createProduct = async (req, res) => {
  try {
    console.log('📦 Creating new product...');
    
    const {
      business_id,
      name,
      description,
      price,
      category
    } = req.body;
    
    if (!business_id || !name) {
      return res.status(400).json({
        error: 'business_id and product name are required'
      });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        error: 'Valid price is required (must be >= 0)'
      });
    }

    let image_url = null;
    let images = null;
    
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
      image_url = imageUrls[0]; 
      images = imageUrls; 
    } else if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }
    
    // Insert product into database
    const { data, error } = await supabase
      .from('products')
      .insert([{
        business_id,
        product_name: name,
        description: description || '',
        price: parsedPrice,
        image_url,
        images,
        category: category || 'General'
      }])
      .select();
    
    if (error) {
      console.error('Database error:', error);
      return res.status(400).json({ 
        error: error.message 
      });
    }
    
    console.log('✅ Product created successfully:', data[0].product_name);
    
    res.status(201).json({
      message: 'Product created successfully',
      product: data[0]
    });
    
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ 
      error: 'Failed to create product' 
    });
  }
};

const getProductsByBusinessId = async (req, res) => {
  try {
    const { business_id } = req.params;
    
    console.log('📦 Fetching products for business:', business_id);
    
    if (!business_id) {
      return res.status(400).json({
        error: 'Business ID is required'
      });
    }
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', business_id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database error:', error);
      return res.status(400).json({ 
        error: error.message 
      });
    }
    
    console.log(`✅ Found ${data.length} products`);
    
    res.json({
      products: data || [],
      count: data ? data.length : 0
    });
    
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch products' 
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'Product ID is required'
      });
    }
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return res.status(404).json({ 
        error: 'Product not found' 
      });
    }
    
    res.json(data);
    
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch product' 
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📝 Updating product:', id);
    console.log('📦 Body:', req.body);
    console.log('📁 Files:', req.files);

    if (!id) {
      return res.status(400).json({
        error: 'Product ID is required'
      });
    }

    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentProduct) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    console.log('📋 Current product:', currentProduct.product_name);
    console.log('📸 Current image_url:', currentProduct.image_url);
    console.log('🖼️ Current images array:', currentProduct.images);

    const updateData = {};
    
    if (req.body.name !== undefined && req.body.name !== null && req.body.name !== '') {
      updateData.product_name = req.body.name;
    }
    
    if (req.body.description !== undefined && req.body.description !== null && req.body.description !== '') {
      updateData.description = req.body.description;
    }
    
    if (req.body.category !== undefined && req.body.category !== null && req.body.category !== '') {
      updateData.category = req.body.category;
    }
    
    if (req.body.price !== undefined && req.body.price !== null && req.body.price !== '') {
      const parsedPrice = parseFloat(req.body.price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          error: 'Valid price is required (must be >= 0)'
        });
      }
      updateData.price = parsedPrice;
    }
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
      updateData.image_url = imageUrls[0];
      updateData.images = imageUrls;
      console.log('📸 New images uploaded:', imageUrls.length);
      console.log('📸 New image_url:', updateData.image_url);
      console.log('🖼️ New images array:', updateData.images);
    } else if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
      console.log('📸 New single image uploaded:', req.file.filename);
    } else {
      updateData.image_url = currentProduct.image_url;
      updateData.images = currentProduct.images;
      console.log('📸 No new images - preserving existing image_url:', updateData.image_url);
      console.log('🖼️ No new images - preserving existing images array:', updateData.images);
    }

    console.log('💾 Final update data:', updateData);
    
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('❌ Database error:', error);
      return res.status(400).json({ 
        error: error.message 
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ 
        error: 'Product not found' 
      });
    }
    
    console.log('✅ Product updated successfully');
    console.log('📋 Updated product:', data[0].product_name);
    console.log('📸 Final image_url in DB:', data[0].image_url);
    console.log('🖼️ Final images array in DB:', data[0].images);
    
    res.json({
      message: 'Product updated successfully',
      product: data[0]
    });
    
  } catch (err) {
    console.error('❌ Update product error:', err);
    res.status(500).json({ 
      error: 'Failed to update product' 
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Deleting product:', id);
  
    if (!id) {
      return res.status(400).json({
        error: 'Product ID is required'
      });
    }
  
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('image_url, images')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('⚠️ Fetch error:', fetchError);
    }
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Database error:', error);
      return res.status(400).json({ 
        error: error.message 
      });
    }
    
    if (product) {
      const fs = require('fs');
      const path = require('path');

      if (product.image_url) {
        try {
          const imagePath = path.join(__dirname, '..', product.image_url);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log('✅ Deleted main image:', imagePath);
          }
        } catch (err) {
          console.error('⚠️ Failed to delete main image:', err.message);
        }
      }

      // Delete additional images
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach(img => {
          try {
            const imgPath = path.join(__dirname, '..', img);
            if (fs.existsSync(imgPath)) {
              fs.unlinkSync(imgPath);
              console.log('✅ Deleted additional image:', imgPath);
            }
          } catch (err) {
            console.error('⚠️ Failed to delete image:', err.message);
          }
        });
      }
    }
    
    console.log('✅ Product deleted successfully (including files)');
    
    res.json({ 
      message: 'Product deleted successfully' 
    });
    
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ 
      error: 'Failed to delete product' 
    });
  }
};

module.exports = {
  createProduct,
  getProductsByBusinessId,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadMiddleware 
};