const { assert } = require("chai");

const { getUserByEmail } = require("../helper-functions/helper-functions");

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", () => {
  it("should return true if user exists", () => {
    const user = getUserByEmail("user@example.com", users);

    assert.isTrue(user);
  });
  it("should return false if email is not found", () => {
    const user = getUserByEmail("notuser@example.com", users);

    assert.isFalse(user);
  });
});
