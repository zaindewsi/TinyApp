const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
const {
  generateRandomString,
  isUser,
  getUser,
  getUserUrls,
} = require("./helper-functions/helper-functions");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.set("view engine", "ejs");

const users = {
  id: "h1f4yz",
  email: "z@d.com",
  password: "123",
};

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
  if (!users[req.cookies["user_id"]]) {
    return res.redirect("/login");
  }

  let myURLS = getUserUrls(urlDatabase, req.cookies["user_id"]);
  console.log(myURLS);

  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: myURLS,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!users[req.cookies["user_id"]]) return res.redirect("/login");

  const templateVars = {
    user: users[req.cookies["user_id"]],
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) return res.redirect("/");

  if (urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"]) {
    return res.status(403).redirect("/");
  }

  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"]) {
    return res.status(403).redirect("/");
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;

  res.redirect("/");
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"]) {
    return res.status(403).redirect("/");
  }
  delete urlDatabase[req.params.id];

  res.redirect("/");
});

//Register

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("register", templateVars);
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

// Login
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };

  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = getUser(users, email, password);

  if (user) {
    res.cookie("user_id", user);
    return res.redirect("/");
  } else return res.status(403).redirect("/login");
});

// Logout

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
