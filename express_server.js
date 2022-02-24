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

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  console.log("req: ", req);
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

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
  res.cookie("username", req.body["username"]); // object username
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});