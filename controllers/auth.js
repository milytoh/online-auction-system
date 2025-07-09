const bcrypt = require("bcryptjs");
const db = require("../models/db");


exports.getRegister = (req, res, next) => {

  console.log(req.session.user)
    
    res.render("auth/register", {
      title: "Register",
      user: req.session.user,
    });
}

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    title: 'Login',
    user: req.session.user
  })
}

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const [existing] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) return res.send("Email already registered.");

    const hashed = await bcrypt.hash(password, 10);
    await db.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashed, role]
    );
    res.redirect("/login");
  } catch (err) {
    console.log(err)
    res.status(500).send("Error registering user.");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) return res.send("User not found.");

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send("Invalid password.");

    req.session.user = {
      id: user.id,
      name: user.name,
      role: user.role,
    };
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Login error.");
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
