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

module.exports = { generateRandomString, isUser, getUser };
