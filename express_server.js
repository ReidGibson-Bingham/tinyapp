const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const res = require("express/lib/response");

app.use(cookieParser());

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

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
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
}

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {

  const userId = req.cookies.user_id;
  console.log("userID: ", userId);
  const user = users[userId];
  console.log("user: ", user);
  const templateVars = { urls: urlDatabase, user: user};
  // const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  console.log("user.id: ", user);
  res.render("urls_index", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {

  
  
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  // let newId = generateRandomString();
  // let newObj = {
  //   id: newId,
  //   email: req.body.email,
  //   password: req.body.password
  // }
  // users[newId] = newObj;
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = { user: user };

  res.render("register", templateVars);

})

app.get("/login", (req, res) => {
  //console.log("req.body: ", req.body);
  const templateVars = {user: null};
  res.render("login", templateVars);
})


app.post("/urls/:shortURL", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  //res.send("testing");         // Respond with 'Ok' (we will replace this)
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});


// vv this POST route will remove a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// i need a route to handle my /login 

app.post("/login", (req,res) => {
  // res.cookie("username", req.body["username"]); // object username
  //console.log(req);
  res.cookie("password", req.body["password"]);
  let userObject = req.body;
  console.log("user object:", userObject);
  const user = getUserWithEmail(userObject.email, users);
  if (!user) {
    res.status(403);
    res.send('Email not found');
    return;
  } else {
    if (userObject.password !== user.password) {
      res.status(403);
      return res.send('email password combination does not exist');
    }
  }
  
  res.cookie("user_id", user.id);
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
  //console.log(users);
});


app.post("/register", (req, res) => {
 
  if (req.body.email === '' || req.body.email.password === '') {
    res.status(400);
    res.send('Please enter email and password');
  }

  for (const property in users) {
    const userObject = users[property];
    if (userObject.email === req.body.email) {
      res.status(400);
      res.send('Email already in use.');
    }
  }

  let newId = generateRandomString();
  let newObj = {
    id: newId,
    email: req.body.email,
    password: req.body.password
  }
  
  // console.log("email: ", req.body.email);
  // console.log("password: ", req.body.password);
  users[newId] = newObj;
  res.cookie("user_id", newId);
  // console.log(users);
  res.redirect("/urls");

})

////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


