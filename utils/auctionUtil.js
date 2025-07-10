const db = require("../models/db");

exports.closeExpiredAuctions = async () => {
  // Get all expired, still-active auctions
  const [expiredAuctions] = await db.execute(`
    SELECT id FROM auctions 
    WHERE end_time <= NOW() AND status = 'active'
  `);

  for (const auction of expiredAuctions) {
    // Get highest bidder for the auction
    const [topBid] = await db.execute(
      `
      SELECT bidder_id FROM bids 
      WHERE auction_id = ? 
      ORDER BY amount DESC LIMIT 1
    `,
      [auction.id]
    );

    const winnerId = topBid.length > 0 ? topBid[0].bidder_id : null;

    // Close auction and update winner
    await db.execute(
      `
      UPDATE auctions 
      SET status = 'closed', winner_id = ? 
      WHERE id = ?
    `,
      [winnerId, auction.id]
    );
  }
};
