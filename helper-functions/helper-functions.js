const generateRandomString = () => Math.random().toString(36).substr(2, 6);

const isUser = (users, email) => {
  for (let key in users) {
    if (users[key].email === email) return true;
  }
  return false;
};

module.exports = { generateRandomString, isUser };
