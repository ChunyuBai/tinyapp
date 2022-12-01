const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const morgan = require('morgan')

const PORT = 8080; // default port 8080

//Installing and Setting Up EJS
app.set("view engine", "ejs");


app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());//cookie use
app.use(morgan('dev'));

// create a url database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// create our user database
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

//create a lookup function for register
const lookupHelper = (email) => {
  for(let key in users){
    if(users[key].email === email) {
      return users[key];
    } 
  }    
  return null;
}
//create a look up function for login
const lookupLogin = (email,password) => {
  for(let key in users) {
    if(users[key].email === email && users[key].password === password){
      return users[key];
    }
  } return null;
}


//Generate a Random Short URL ID
const generateRandomString = () => {
  return Math.random().toString(20).substring(2,8);
}

// Home page says Hello
app.get("/", (req, res) => {
  res.send("Hello!");  
}); 

// check our urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["userId"];
  const user = users[userId];
  const templateVars = { 
    user: user,
    urls: urlDatabase };
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
    const userId = req.cookies["userId"];
    const user = users[userId];
  res.render("urls_new",{
    user:user,
  });
});

//go to the register site
app.get("/register",(req,res) => {
  const templateVars = {
    user: null,
  }
  res.render("urls_register",templateVars);
})

//Create a Registration Handler
app.post("/register",(req,res) => {
  const userID = generateRandomString();
  const {email} = req.body;
  const {password} = req.body;
  const result = lookupHelper(email);
  if(email.trim() === "" ){
    res.status(400).send("empty email")
  } 
   else if(result){
    res.status(400).send("email has been used")
  } else {
    users[userID] = {id:userID,email,password};
  }
  res.cookie('userId',userID);
  res.redirect("/urls");
  console.log(users);
  console.log(result);
})


//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  console.log(req.body); // Log the POST request body to the console/
  res.redirect('/urls/:id');//Redirect After Form Submission
});


//Delete a url
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL]
  res.redirect('/urls');//Redirect After Form Submission
});


//login a user
app.get("/login",(req,res) => {
  const templateVars = {
    user: null,
  }
  res.render("login", templateVars)
})

app.post("/login", (req, res) => {
  // const username = req.body.username;
  
  const {email} = req.body;
  const {password} = req.body;
  const user = lookupLogin(email,password)
  if(user){
    res.cookie('userId',user.id) 
  } else {
    res.status(403).send("not found user")
  }
  res.redirect('/urls');//Redirect After Form Submission
});
//logout a user
app.post("/logout",(req, res) => {
  res.clearCookie("userId");
  res.redirect('/urls');
})


//Edit button takes to edit page
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');//Redirect After Form Submission
});
//Adding a Second Route and Template
 app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = { username: req.cookies["userName"],
    id: id, longURL: urlDatabase[id]};
  res.render("urls_show", templateVars);
});

// Redirect Short URLs
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]
  res.redirect(longURL); // Example: http://localhost:8080/u/b2xVn2 => http://www.lighthouselabs.ca
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
