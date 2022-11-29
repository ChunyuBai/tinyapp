const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//Installing and Setting Up EJS
app.set("view engine", "ejs");


app.use(express.urlencoded({ extended: true }));


// create a url database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//sending response with HTML code
app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
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
  res.render("urls_new");
});

//Add a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  // urldabase = { 'abc123': 'facebook.com"}
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  console.log(req.body); // Log the POST request body to the console
  res.send("ok")// Respond with 'Ok' (we will replace this) 
  res.redirect('/urls/:id');//Redirect After Form Submission
});

//Delete a url
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL]
  res.redirect('/urls');//Redirect After Form Submission
});

//Edit our url
// add.post("/urls/:id/edit",(req,res) => {
//   const shortURL = req.params.id;
      
//   res.redirect('/urls');
// })


//Adding a Second Route and Template
 app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = { id: id, longURL: urlDatabase[id]};
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
