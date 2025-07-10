const db = require("../models/db");
const { closeExpiredAuctions } = require("../utils/auctionUtil");

exports.getIndex = async (req, res, next) => {
  await closeExpiredAuctions();
  try {
    const [auctions] = await db.execute(
      // 'SELECT * FROM auctions WHERE status = "active" AND end_time > NOW() ORDER BY end_time ASC'
      "SELECT * FROM auctions "
    );

    res.render("index", { title: "Home", user: req.session.user, auctions });
  } catch (err) {
    console.log(err);
  }
};
