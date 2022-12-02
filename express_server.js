const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session')
const {getUserByEmail} = require('./helpers')

const PORT = 8080; // default port 8080

//Installing and Setting Up EJS
app.set("view engine", "ejs");

//API using
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["rhq78h73229h9adhas","djwiqohfoqhiofhd"]
}))
// create a url database
const urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca",
              userID: "userRandomID"
              },
  "9sm5xK": {longURL:"http://www.google.com",
             userID: "user2RandomID"
              }
};

//create a urlsForuser function
const urlsForUser = (id) => {
  const userURLs = {};
for(let key in urlDatabase){
  if(urlDatabase[key].userID === id){
    userURLs[key] = urlDatabase[key];
  }
} return userURLs;
}

// create our user database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123",
  },
};

//Generate a Random Short URL ID
const generateRandomString = () => {
  return Math.random().toString(20).substring(2,8);
}

// check our urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!userId){
    return res.status(400).send('<div>You need to login</div>');
  }  
  const url = urlsForUser(userId);
  
  const templateVars = { 
    user: user,
    urls: url };
  res.render("urls_index", templateVars);
});

//sending response with HTML code
app.get("/hello", (req, res) => {
  const templateVars = {
    username: req.cookies["userName"],
 greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});


//scope practice
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });



//Add a GET Route to Show the Form
 app.get("/urls/new", (req, res) => {
    const userId = req.session.user_id;
    if (!userId) {
    return res.redirect('/login');
  }
  const user = users[userId];
  res.render("urls_new",{
    user:user,
  });
});



//go to the register site
app.get("/register",(req,res) => {
  const userId = req.session.user_id;
  if (userId) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: null,
  }
  res.render("urls_register",templateVars);
  // res.redirect('/urls');
})

//Create a Registration Handler
app.post("/register",(req,res) => {
  const userID = generateRandomString();
  const {email} = req.body;
  const {password} = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = getUserByEmail(email,users);
  if(email.trim() === "" ){
    return res.status(400).send("empty email")
  } 
  else if(result){
    return res.status(400).send("email has been used")
  } else {
    req.session.user_id = userID;
    res.redirect("/urls");
    users[userID] = {id:userID,email,password:hashedPassword};
  }
})


//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const userID = req.session.user_id
  if (!userID){
    return res.status(400).send('<div>You need to login</div>');
  }
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL]={userID,longURL};
  res.redirect(`/urls/${shortURL}`);
});


//Delete a url
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.user_id;
  if(!userID){
    res.status(403).send("please login")
  } else if(urlDatabase[shortURL].longURL === undefined) {
    res.status(403).send("URL not exist")
  } else if(userID !== urlDatabase[shortURL].userID) {
    res.status(403).send("do not own URL")
  } else {
    delete urlDatabase[shortURL]
    res.redirect('/urls');//Redirect After Form Submission
  }
});


//login a user
app.get("/login",(req,res) => {
  const userId = req.session.user_id
  if (userId){
   return res.redirect('/urls');
  }
  const templateVars = {
    user: null,
  }
  res.render("login", templateVars)
})

app.post("/login", (req, res) => {
  const {email,password} = req.body;
  const user = getUserByEmail(email,users)
  if(user){
    req.session.user_id = user.id;
  } else {
    res.status(403).send("not found user")
  }
  if(!bcrypt.compareSync(password,user.password)){
    res.status(403).send("wrong passwordd")
  }
  res.redirect('/urls');//Redirect After Form Submission
});

//logout a user
app.post("/logout",(req, res) => {
  req.session = null;
  res.redirect('/login');
})


//Edit button takes to edit page
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  const userID = req.session.user_id
  if(!userID){
    res.status(403).send("please login")
  } else if(urlDatabase[shortURL].longURL === undefined) {
    res.status(403).send("URL not exist")
  } else if(userID !== urlDatabase[shortURL].userID) {
    res.status(403).send("do not own URL")
  } else {  
    urlDatabase[shortURL].longURL = longURL;
    res.redirect('/urls');//Redirect After Form Submission
  }
});
//Adding a Second Route and Template
 app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id
  const user = users[userId];
  const shortURL = req.params.shortURL;
  if (!userId){
    return res.status(400).send('<div>You need to login</div>');
  }
  const templateVars = { 
    user,
    id: shortURL,
    longURL: urlDatabase[shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

// Redirect Short URLs
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if(urlDatabase[id]){
    const longURL = urlDatabase[id].longURL
    return res.redirect(longURL);
  } else {
    return res.status(400).send("do not exist");
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
