const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const {getUserByEmail,generateRandomString,urlsForUser,urlDatabase,users} = require('./helpers');


const PORT = 8080; 

//Installing and Setting Up EJS
app.set("view engine", "ejs");

//API using
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["rhq78h73229h9adhas","djwiqohfoqhiofhd"]
}))

//urls get rounte
  app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  //check user login status
    if (!userId){
      return res.redirect('/login');
    } else {
      const url = urlsForUser(userId);
      const templateVars = { 
      user: user,
      urls: url };
      return res.render("urls_index", templateVars);
      }
    }
  );
  
  //Add a POST Route to Receive the Form Submission
  app.post("/urls", (req, res) => {
    const userID = req.session.user_id;
    //if the user has not login yet, send them an error message
    if (!userID) {
      return res.status(400).send('You need to login');
    } else {
    // generate a random string for shorten url ID
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL]={userID,longURL};
    return res.redirect(`/urls/${shortURL}`);
    }
   }
  );

//Add a GET Route to Show the Form
 app.get("/urls/new", (req, res) => {
    const userId = req.session.user_id;
      //check user login status, if not, send them to login page
    if (!userId) {
    return res.redirect('/login');
  } 
    const user = users[userId];
    return res.render("urls_new",{
    user:user,
        }
      ); 
    }
  );



//go to the register site
app.get("/register",(req,res) => {
  const userId = req.session.user_id;
  //  //check user login status, if yes, send them to urls page
  if (userId) {
    return res.redirect('/urls');
  } else {
  const templateVars = {
    user: null,
  }
  return res.render("urls_register",templateVars);
    } 
  } 
);

//Create a Registration Handler
app.post("/register",(req,res) => {
  const userID = generateRandomString();
  const {email} = req.body;
  const {password} = req.body;
  //generate a hash number for password
  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = getUserByEmail(email,users);
  if(!email.trim()){
    return res.status(400).send("empty email")
  } else if(!password){
    return res.status(400).send("password cannot be empty")
  } else if(result){
    return res.status(400).send("email has been used")
  } else {
    req.session.user_id = userID;
    //compare the password with hash number
    users[userID] = {id:userID,email,password:hashedPassword};
    return res.redirect("/urls");
    }
  }
);


//Delete a url
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.user_id;
  //  //check user login status
  if(!userID){
   return res.status(403).send("please login")
   //check the longURL is exist in URLdatabase or not
  } else if(!urlDatabase[shortURL].longURL) { 
   return res.status(403).send("URL not exist")
   //check cookie is same as urls owner
  } else if(userID !== urlDatabase[shortURL].userID) { 
   return res.status(403).send("do not own URL")
  } else {
    delete urlDatabase[shortURL]
   return res.redirect('/urls');
  }
});


//login a user
app.get("/login",(req,res) => {
  const userId = req.session.user_id
  //  //check user login status
  if (userId){
   return res.redirect('/urls');
  } 
  const templateVars = {
    user: null,
  }
  return res.render("login", templateVars)
})

app.post("/login", (req, res) => {
  const {email,password} = req.body;
  //using seaching function check user is in user database
  const user = getUserByEmail(email,users)
  if(!user){
    res.status(403).send("not found user")
    //compare the user database hash number password
  } else if(!bcrypt.compareSync(password,user.password)){
    res.status(403).send("wrong password")
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});

//logout a user
app.post("/logout",(req, res) => {
  //clear all the session cookie and redirect them to login page
  req.session = null;
  res.redirect('/login');
})


//Edit button takes to edit page
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  const userID = req.session.user_id
    //check user login status
  if(!userID){
    res.status(403).send("please login")
    //check longURL is exist on urls database or not
  } else if(!urlDatabase[shortURL].longURL) {
    res.status(403).send("URL not exist")
    //check cookie is same as the urls owner
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
  //check user login status 
  if (!userId){
    return res.status(400).send('You need to login');
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

//root url will redirect to my urls page
app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
