const express = require("express");
const router = express.Router();
const buyerController = require("../controllers/buyer");
const { isAuth } = require("../middlewares/auth");

// View all auctions
router.get("/auctions", buyerController.listAuctions);

// View single auction
router.get("/auction/:id", buyerController.viewAuction);

// Place a bid
router.post("/auction/:id/bid", isAuth, buyerController.placeBid);

module.exports = router;
