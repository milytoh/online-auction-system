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


exports.myWins = async (req, res) => {
  const buyerId = req.session.user.id;

  const [wonAuctions] = await db.execute(
    `
    SELECT a.*, u.name AS seller_name 
    FROM auctions a 
    JOIN users u ON a.seller_id = u.id
    WHERE a.winner_id = ?
    ORDER BY a.end_time DESC
  `,
    [buyerId]
  );

  res.render("buyer/my-wins", {
    title: 'My Wins',
    user: req.session.user,
    auctions: wonAuctions,

  });
};


exports.myBids = async (req, res) => {
  const buyerId = req.session.user.id;

  const [bids] = await db.execute(
    `
    SELECT DISTINCT a.*, u.name AS seller_name,
      (SELECT MAX(amount) FROM bids WHERE auction_id = a.id) AS highest_bid,
      (SELECT amount FROM bids WHERE auction_id = a.id AND bidder_id = ? ORDER BY amount DESC LIMIT 1) AS my_bid
    FROM bids b
    JOIN auctions a ON b.auction_id = a.id
    JOIN users u ON a.seller_id = u.id
    WHERE b.bidder_id = ?
    ORDER BY a.end_time DESC
  `,
    [buyerId, buyerId]
  );

  res.render("buyer/my-bids", {
    title: 'My Bids',
    user: req.session.user,
    auctions: bids,

  });
};
