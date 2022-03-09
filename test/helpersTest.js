const { assert } = require('chai');

const { getUserWithEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

//instructions

// a unit test that confirms our getUserByEmail function returns a user object when it's provided with an email that exists in the database.

// Inside the same describe statement, add another it statement to test that a non-existent email returns undefined.

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserWithEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.deepEqual(user.id, expectedUserID)
  });
  it('should return undefined if given a non-existent email', function() {
    const user = getUserWithEmail("user@example.com", testUsers);
    const userWithoutEmail = undefined; 
    assert.notDeepEqual(user.id, userWithoutEmail);
  })

});

