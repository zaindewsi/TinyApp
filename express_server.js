const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const {
  generateRandomString,
  getUserByEmail,
  getUser,
  getUserUrls,
} = require("./helper-functions/helper-functions");

app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);
app.use(express.static("public"));

app.set("view engine", "ejs");

const users = {};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (!users[req.session["user_id"]]) {
    return res.redirect("/login");
  }

  let myURLS = getUserUrls(urlDatabase, req.session["user_id"]);

  const templateVars = {
    user: users[req.session["user_id"]],
    urls: myURLS,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!users[req.session["user_id"]]) return res.redirect("/login");

  const templateVars = {
    user: users[req.session["user_id"]],
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) return res.redirect("/");

  if (urlDatabase[req.params.shortURL].userID !== req.session["user_id"]) {
    return res.status(403).redirect("/");
  }

  const templateVars = {
    user: users[req.session["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"],
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  if (
    urlDatabase[req.params.shortURL].userID !== req.coosessionkies["user_id"]
  ) {
    return res.status(403).redirect("/");
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;

  res.redirect("/");
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session["user_id"]) {
    return res.status(403).redirect("/");
  }
  delete urlDatabase[req.params.id];

  res.redirect("/");
});

//Register

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (!email || !password) {
    console.log("missing field");
    return res.status(400).redirect("/register");
  }

  if (getUserByEmail(email, users)) {
    console.log("user already exists");
    return res.status(400).redirect("/register");
  }

  const id = generateRandomString();

  const newUser = {
    id,
    email,
    password,
  };

  users[id] = newUser;

  req.session.user_id = id;

  res.redirect("/urls");
});

// Login
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };

  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = getUser(users, email, password);

  if (user) {
    req.session.user_id = user;
    return res.redirect("/");
  } else return res.status(403).redirect("/login");
});

// Logout

app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
