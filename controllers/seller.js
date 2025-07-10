const db = require("../models/db");

exports.dashboard = async (req, res) => {
  const sellerId = req.session.user.id;
  const [auctions] = await db.execute(
    "SELECT * FROM auctions WHERE seller_id = ? ORDER BY end_time DESC",
    [sellerId]
  );
  res.render("seller/dashboard", {title: 'Dashboard', auctions, user: req.session.user,  });
};

exports.getAddForm = (req, res, next) => {
    res.render('seller/addform', {title: 'Add aucton', user: req.session.user})
}

exports.addAuction = async (req, res) => {
  const { title, description, start_price, end_time } = req.body;
  const image = req.file?.filename || "";
  const seller_id = req.session.user.id;

  await db.execute(
    `INSERT INTO auctions (title, description, image, start_price, current_price, start_time, end_time, seller_id) 
     VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`,
    [title, description, image, start_price, start_price, end_time, seller_id]
  );

  res.redirect("/dashboard");
};
