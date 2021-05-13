const generateRandomString = () => Math.random().toString(36).substr(2, 6);

const isUser = (users, email) => {
  for (let key in users) {
    if (users[key].email === email) return true;
  }
  return false;
};

const getUser = (users, email, password) => {
  for (let id in users) {
    if (users[id].email === email) {
      if (users[id].password === password) {
        return id;
      } else console.log("invalid password");
    } else console.log("invalid email");
  }
  return null;
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

module.exports = { generateRandomString, isUser, getUser, getUserUrls };
