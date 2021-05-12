const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
const {
  generateRandomString,
  isUser,
  getUser,
} = require("./helper-functions/helper-functions");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.set("view engine", "ejs");

const users = {};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };

  if (!users[req.cookies["user_id"]]) res.redirect("/login");

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_register", templateVars);
});

app.post("/urls", (req, res) => {
  const randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  res.redirect(`/urls/${randomURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];

  res.redirect("/");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;

  res.redirect("/");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };

  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = getUser(users, email, password);

  if (user) {
    res.cookie("user_id", user);
    res.redirect("/");
  } else res.status(403).redirect("/login");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

  res.redirect("/");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("missing field");
    return res.status(400).redirect("/register");
  }

  if (isUser(users, email)) {
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

  res.cookie("user_id", id);

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
