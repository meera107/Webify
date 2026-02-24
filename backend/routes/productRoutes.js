const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.post('/', productController.uploadMiddleware, productController.createProduct);
router.get('/:business_id', productController.getProductsByBusinessId);
router.put('/:id', productController.uploadMiddleware, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;