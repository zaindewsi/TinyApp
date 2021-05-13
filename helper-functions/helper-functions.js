const bcrypt = require("bcrypt");
const generateRandomString = () => Math.random().toString(36).substr(2, 6);

const getUserByEmail = (email, users) => {
  for (let id in users) {
    if (users[id].email === email) {
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
      }
    }
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

const currentDate = () => {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  return `${year}/${month}/${day}`;
};

module.exports = {
  generateRandomString,
  getUser,
  getUserUrls,
  getUserByEmail,
  currentDate,
};
