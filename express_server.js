// http://localhost:8080/urls  <-- browser url input

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const res = require("express/lib/response");
const helpers = require("./helpers");

app.use(cookieParser());

var cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ['lskdjasldkjflkasjd', 'asldkjfkoijwe0934j'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


let hashedPassword = 0;

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
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
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/urls/new", (req, res) => {
    const userId = req.session.user_id;
    const user = users[userId];
    const templateVars = {user: user};
    res.render("urls_new", templateVars, ); 
  
});

//the /urls page should not display URLs unless the user is logged in
app.get("/urls", (req, res) => {

  const userId = req.session.user_id;

  const user = users[userId];

  const templateVars = { urls: urlDatabase, user: user, users: users};
  
  res.render("urls_index", templateVars);
  
});

app.post("/urls", (req, res) => {
  
  const newLongURL = req.body.longURL;
  let newId = helpers.generateRandomString();

  urlDatabase[newId] = {
    longURL: newLongURL, 
  
    userID: req.session.user_id
  };
  
  res.redirect("/urls");
})


app.get("/urls/:shortURL", (req, res) => {

  const userId = req.session.user_id;
  const user = users[userId];
  
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: user};
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { user: user };
  
  res.render("register", templateVars);

})

app.get("/login", (req, res) => {
 
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {user: user};
  res.render("login", templateVars);
  
})




app.post("/urls/:shortURL", (req, res) => {
  
  const newLongURL = req.body.longURL;
  urlDatabase[req.params.shortURL].longURL = newLongURL;
  
  res.redirect("/urls");
});


// vv this POST route will remove a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL].longURL;
  
  res.redirect("/urls");
});



app.post("/login", (req,res) => {
  
  res.cookie("password", req.body["password"]);
  const testEmail = req.body.email;
  const testPassword = req.body.password;
  
  const checkUser = helpers.getUserWithEmail(testEmail, users);
  if (!checkUser) {
    res.status(403);
    return res.send('Email not found');
  }//// VVV if the testpassword is not the same as the hashedPassword then return an error
  if (!bcrypt.compareSync(testPassword, hashedPassword)) {
    res.status(403);
    return res.send('email password combination does not exist');
  }



  res.cookie("user_id", checkUser.id);
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
  
  
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

  let newId = helpers.generateRandomString();
  let newObj = {
    id: newId,
    email: req.body.email,
    password: req.body.password
  }
  hashedPassword = bcrypt.hashSync(req.body.password, 10);
  
  
  users[newId] = newObj;
  res.cookie("user_id", newId);
  
  res.redirect("/urls");

})

////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


