function generateRandomString() {
  let randomString = Math.random();
  randomString = randomString.toString(36);
  return randomString.slice(2, 8);
}

function getUserWithEmail(email, usersDatabase) {
  for (let user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return usersDatabase[user];
    }
  }
  return null;
}

module.exports = {
  getUserWithEmail,
  generateRandomString
}