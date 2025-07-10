const db = require("../models/db");
const { closeExpiredAuctions } = require("../utils/auctionUtil");

exports.dashboard = async (req, res) => {
  await closeExpiredAuctions();

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

// Show edit form
exports.editForm = async (req, res) => {
  const id = req.params.id;
  const [[auction]] = await db.execute('SELECT * FROM auctions WHERE id = ? AND seller_id = ?', [id, req.session.user.id]);

  if (!auction || auction.status !== 'active') return res.send('Cannot edit closed or non-existent auction.');
  res.render('seller/editform', {title: 'Edit Auction', auction, user: req.session.user });
};

// Handle edit form submit
exports.updateAuction = async (req, res) => {
  const { title, description, end_time } = req.body;
  const id = req.params.id;

  await db.execute(`
    UPDATE auctions SET title = ?, description = ?, end_time = ? 
    WHERE id = ? AND seller_id = ? AND status = 'active'
  `, [title, description, end_time, id, req.session.user.id]);

  res.redirect('/dashboard');
};

// Delete auction
exports.deleteAuction = async (req, res) => {
  const id = req.params.id;

  await db.execute('DELETE FROM auctions WHERE id = ? AND seller_id = ?', [id, req.session.user.id]);
  res.redirect('/dashboard');
};
