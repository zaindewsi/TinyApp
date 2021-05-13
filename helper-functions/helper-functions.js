const bcrypt = require("bcrypt");
const generateRandomString = () => Math.random().toString(36).substr(2, 6);

const getUserByEmail = (email, users) => {
  for (let name in users) {
    if (users[name].email === email) {
      return true;
    }
  }
  return false;
};

const getUser = (users, email, password) => {
  for (let id in users) {
    if (users[id].email === email) {
      if (bcrypt.compareSync(password, users[id].password)) {
        return id;
      } else console.log("invalid password");
    } else console.log("invalid email");
  }
  return false;
};

const getUserUrls = (urlDatabase, userID) => {
  let urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};

module.exports = {
  generateRandomString,
  getUser,
  getUserUrls,
  getUserByEmail,
};
