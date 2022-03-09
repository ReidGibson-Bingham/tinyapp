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

// function generateRandomString() {
//   let randomString = Math.random();
//   randomString = randomString.toString(36);
//   return randomString.slice(2, 8);
// }

// function getUserWithEmail(email, usersDatabase) {
//   for (let user in usersDatabase) {
//     if (usersDatabase[user].email === email) {
//       return usersDatabase[user];
//     }
//   }
//   return null;
// }

//let loggedIn = true; // a variable to check whether or not a user has already logged in. With this variable, we can allow only users who have logged in to edit and add new links

let hashedPassword = 0;

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };


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

// when refactoring these keys into objects containing the long url and the user_id, i'm not too sure how to access the correct keys. ie urlDatabase[somevariable].longUrl

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
  //let objId = req.params;
  // const longURL = urlDatabase[objId].shortURL; // I think this is what i have to do in compass' second last activity
  //const longURL = urlDatabase[req.params.shortURL][longURL];
  console.log("req.params: ", req.params);
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/urls/new", (req, res) => {
    console.log("This is the urls new route");
    // const userId = req.cookies.user_id;
    const userId = req.session.user_id;
    const user = users[userId];
    const templateVars = {user: user};
    res.render("urls_new", templateVars, ); 
  
});

//the /urls page should not display URLs unless the user is logged in
app.get("/urls", (req, res) => {

  // const userId = req.cookies.user_id;
  const userId = req.session.user_id;
  //console.log("req.params: ", req.params);
  const user = users[userId];
  //console.log("user: ", user);
  //console.log("userId: ", users[userId].id);
  const templateVars = { urls: urlDatabase, user: user, users: users};
  

  res.render("urls_index", templateVars);
  
});

app.post("/urls", (req, res) => {
  console.log("this is the urls route");
  const newLongURL = req.body.longURL;
  let newId = helpers.generateRandomString();
//   i3BoGr: {
//     longURL: "https://www.google.ca",
//     userID: "aJ48lW"
// }
  urlDatabase[newId] = {
    longURL: newLongURL, 
    // userID: req.cookies.user_id
    userID: req.session.user_id
  };
  // urlDatabase[req.params.shortURL].longURL = newLongURL;
  console.log('new:', newLongURL);
  res.redirect("/urls");
})


app.get("/urls/:shortURL", (req, res) => {
  // const userId = req.cookies.user_id;
  const userId = req.session.user_id;
  const user = users[userId];
  
  // vv this is where i start to get confused about req.params etc
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: user};
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
  // const userId = req.cookies.user_id;
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { user: user };
  
  res.render("register", templateVars);

})

app.get("/login", (req, res) => {
  //console.log("req.body: ", req.body);
  // const userId = req.cookies.user_id;
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {user: user};
  res.render("login", templateVars);
  
})




app.post("/urls/:shortURL", (req, res) => {
  
  //console.log(req.body);  // Log the POST request body to the console
  //res.send("testing");         // Respond with 'Ok' (we will replace this)
  //urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  //console.log("user-input :")
  const newLongURL = req.body.longURL;
  urlDatabase[req.params.shortURL].longURL = newLongURL;
  
  res.redirect("/urls");
});


// vv this POST route will remove a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL].longURL;
  
  res.redirect("/urls");
});

// i need a route to handle my /login 

app.post("/login", (req,res) => {
  // res.cookie("username", req.body["username"]); // object username
  //console.log(req);
  res.cookie("password", req.body["password"]);
  const testEmail = req.body.email;
  const testPassword = req.body.password;
  // let userObject = req.body;
  // console.log("user object:", userObject);
  // const checkUser = getUserWithEmail(testEmail, users);
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
  //setTimeout(() => {res.redirect("/urls")}, 3000);// redirecting the user to the homepage after seeing an email not found message if they've provided incorrect info
  
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
  // users[req.cookies.user_id] = {
  //   id: req.cookies.user_id,
  //   email: req.body.email,
  //   password: req.body.password
  // };
  
  // testing using loads of console.logs to figure stuff out
  // console.log('cookie contents:', req.cookies);
  console.log('cookie contents:', req.session);
  // console.log('cookie user id:', req.cookies.user_id);
  console.log('cookie user id:', req.session.user_id);
  //console.log('password: ', req.body.password);
  //console.log('email: ', req.body.email);
  //console.log('users object: ', users);

  console.log("is the hashed password the same as the original", (bcrypt.compareSync(req.body.password, hashedPassword)));
  
  console.log('hashedPassword: ', hashedPassword);
  
  users[newId] = newObj;
  res.cookie("user_id", newId);
  
  res.redirect("/urls");

})

////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// for some reason my cookie id only works when i've already got a cookie registered in my browser, i have to start the server up with a cookie in my browser to be able to get it's id