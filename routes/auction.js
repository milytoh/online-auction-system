const express = require('express');

const router = express.Router();

const auctionController = require('../controllers/auction');

router.get('/', auctionController.getIndex);

module.exports = router;