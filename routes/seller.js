const { isSeller, isAuth } = require("../middlewares/auth");

const express = require("express");
const multer = require("multer");

const router = express.Router();
const sellerController = require("../controllers/seller");

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  },
});
const upload = multer({ storage });

router.get("/dashboard", isAuth, isSeller, sellerController.dashboard);
router.get("/add-auction", isAuth, isSeller, sellerController.getAddForm);
router.post(
  "/add-auction",
  isAuth,
  isSeller,
  upload.single("image"),
  sellerController.addAuction
);

// Edit form
router.get('/edit/:id', isSeller, sellerController.editForm);

// Submit edit
router.post('/edit/:id', isSeller, sellerController.updateAuction);

// Delete auction
router.post('/delete/:id', isSeller, sellerController.deleteAuction);


module.exports = router;
