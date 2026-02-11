const express = require('express');
const router = express.Router();
const rendererController = require('../controllers/rendererController');

// Website Preview & PDF Generation Routes
router.get('/preview/:business_id/:template_name', rendererController.previewWebsite);
router.post('/generate-brochure/:business_id/:template_name', rendererController.generateBrochure);
router.post('/generate-catalog/:business_id', rendererController.generateCatalog);
router.get('/download/:filename', rendererController.downloadPDF);
router.get('/templates', rendererController.getTemplates);

module.exports = router;