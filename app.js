const express = require("express");
const session = require("express-session");
const path = require("path");


const app = express();
const flash = require("connect-flash");
const MySQLStore = require("express-mysql-session")(session);
const db = require('./models/db')

const auctionRoute = require("./routes/auction");
const authRoute = require("./routes/auth");
const sellerRoute = require("./routes/seller");
const buyerRoute = require("./routes/buyer");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Session store config
const sessionStore = new MySQLStore({}, db); //

// Session setup
app.use(
  session({
    secret:
      "4d8f2a8304b1c19ab4b8a87497f0cd87ee8d6a7a0a2cfb6dd0e41d6dd66a34dc...",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 1000 * 60 * 60 * 2 },
  })
);

app.use(flash());

// Routes
app.use(auctionRoute);
app.use(authRoute);
app.use(sellerRoute);
app.use(buyerRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
