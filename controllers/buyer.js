const db = require("../models/db");
const { closeExpiredAuctions } = require("../utils/auctionUtil");

// List active auctions
exports.listAuctions = async (req, res) => {
    await closeExpiredAuctions();
  const [auctions] = await db.execute(
    'SELECT * FROM auctions WHERE status = "active" AND end_time > NOW() ORDER BY end_time ASC'
  );
  res.render("buyer/auctions_list", {
    title: "Auctions",
    auctions,
    user: req.session.user,
  });
};

// View single auction


exports.viewAuction = async (req, res) => {
  const auctionId = req.params.id;

  const [[auction]] = await db.execute("SELECT * FROM auctions WHERE id = ?", [
    auctionId,
  ]);

  const [bids] = await db.execute(
    `
      SELECT b.*, u.name AS bidder_name 
      FROM bids b 
      JOIN users u ON b.bidder_id = u.id 
      WHERE auction_id = ? 
      ORDER BY bid_time DESC
    `,
    [auctionId]
  );

  let winner = null;
  if (auction.winner_id) {
    const [[winnerUser]] = await db.execute(
      "SELECT name FROM users WHERE id = ?",
      [auction.winner_id]
    );
    winner = winnerUser.name;
  }

    res.render("buyer/auction_details", {
      title: "Auction details",
      auction,
      bids,
      user: req.session.user,
      winner,
    });
};
  

// Place a bid
exports.placeBid = async (req, res) => {
  const auctionId = req.params.id;
  const { amount } = req.body;
  const bidderId = req.session.user.id;

  try {
    const [[auction]] = await db.execute(
      "SELECT * FROM auctions WHERE id = ?",
      [auctionId]
    );

    if (!auction || auction.status !== "active")
      return res.send("Auction not found or closed.");
    if (new Date(auction.end_time) < new Date())
      return res.send("Auction has already ended.");
    if (parseFloat(amount) <= parseFloat(auction.current_price))
      return res.send("Bid must be higher than current price.");

    await db.execute(
      "INSERT INTO bids (auction_id, bidder_id, amount) VALUES (?, ?, ?)",
      [auctionId, bidderId, amount]
    );

    await db.execute("UPDATE auctions SET current_price = ? WHERE id = ?", [
      amount,
      auctionId,
    ]);

    res.redirect(`/auction/${auctionId}`);
  } catch (err) {
    console.log(err);
  }
};
