const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");
const {
  generateRandomString,
  getUserByEmail,
  getUser,
  getUserUrls,
  currentDate,
} = require("./helper-functions/helper-functions");

app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

const PORT = 8080;
const users = {};
const urlDatabase = {};

//main pages
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (!users[req.session["userID"]]) {
    return res.redirect("/login?redirect=true");
  }

  let denied = req.query.denied ? true : false;
  let noURL = req.query.noURL ? true : false;

  let myURLS = getUserUrls(urlDatabase, req.session["userID"]);

  const templateVars = {
    user: users[req.session["userID"]],
    urls: myURLS,
    denied,
    noURL,
  };
  res.render("urls_index", templateVars);
});

// create new url

app.get("/urls/new", (req, res) => {
  if (!users[req.session["userID"]])
    return res.redirect("/login?redirect=true");

  let redirect;

  if (req.query.redirect) {
    redirect = JSON.parse(req.query.redirect);
  }

  const templateVars = {
    user: users[req.session["userID"]],
    redirect,
  };

  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session["userID"],
    created: currentDate(),
  };
  res.redirect(`/urls/${shortURL}`);
});

//view short url page
app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL])
    return res.redirect("/urls?noURL=true");

  if (urlDatabase[req.params.shortURL].userID !== req.session["userID"]) {
    return res.status(403).redirect("/urls?denied=true");
  }

  const templateVars = {
    user: users[req.session["userID"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    created: urlDatabase[req.params.shortURL].created,
  };
  res.render("urls_show", templateVars);
});

app.put("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.session["userID"]) {
    return res.status(403).redirect("/");
  }

  if (!urlDatabase[req.params.id]) {
    return res.status(404).redirect("/urls");
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;

  res.redirect("/");
});

//Redirect to long url
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.send(
      "<h1>Sorry, that URL does not exist</h1><p><a href='/'>Go back</a></p>"
    );
  }

  const longURL = urlDatabase[req.params.shortURL].longURL;

  if (longURL.includes("http")) {
    res.redirect(longURL);
  } else {
    res.redirect(`https://${longURL}`);
  }
});

app.delete("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.session["userID"]) {
    return res.status(403).redirect("/urls?denied=true");
  }
  delete urlDatabase[req.params.id];

  res.redirect("/");
});

//Register
app.get("/register", (req, res) => {
  if (users[req.session["userID"]]) {
    return res.redirect("/urls");
  }
  let exists = req.query.exists ? true : false;

  const templateVars = {
    user: users[req.session["userID"]],
    exists,
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (!email || !password) {
    return res.status(400).redirect("/register");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).redirect("/register?exists=true");
  }

  const id = generateRandomString();

  const newUser = {
    id,
    email,
    password,
  };

  users[id] = newUser;

  req.session.userID = id;

  res.redirect("/urls");
});

// Login
app.get("/login", (req, res) => {
  if (users[req.session["userID"]]) {
    return res.redirect("/urls");
  }

  let redirect;
  let loginFailed;

  if (req.query.redirect) {
    redirect = JSON.parse(req.query.redirect);
  }
  if (req.query.loginFailed) {
    loginFailed = JSON.parse(req.query.loginFailed);
  }

  const templateVars = {
    user: users[req.session["userID"]],
    redirect,
    loginFailed,
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUser(users, email, password);

  if (user) {
    req.session.userID = user;
    return res.redirect("/");
  } else return res.status(403).redirect("/login?loginFailed=true");
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
