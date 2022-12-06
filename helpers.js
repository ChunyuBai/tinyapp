const getUserByEmail = function(email, database) {
  for(let key in database){
    if(database[key].email === email) {
      return database[key];
    } 
  } return null;  
};

//Generate a Random Short URL ID
const generateRandomString = () => {
  return Math.random().toString(20).substring(2,8);
}

//create a urlsForuser function
const urlsForUser = (id) => {
  const userURLs = {};
for (let key in urlDatabase) {
  if(urlDatabase[key].userID === id) {
    userURLs[key] = urlDatabase[key];
    }
  } return userURLs;
}

// create a url database
const urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca",
              userID: "userRandomID"
              },
  "9sm5xK": {longURL:"http://www.google.com",
             userID: "user2RandomID"
              }
};

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

module.exports = {getUserByEmail,generateRandomString,urlsForUser,urlDatabase,users};