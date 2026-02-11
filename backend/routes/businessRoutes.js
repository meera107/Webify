const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');

// Business CRUD Routes
router.post('/', businessController.createBusiness);
router.get('/:id', businessController.getBusinessById);
router.get('/user/:user_id', businessController.getBusinessesByUserId);
router.put('/:id', businessController.updateBusiness);
router.delete('/:id', businessController.deleteBusiness);

module.exports = router;