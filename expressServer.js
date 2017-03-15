'use strict';

//set up
const express = require('express')
const app = express()
app.set('view engine', 'ejs')

const morgan = require('morgan')
app.use(morgan('dev'))

const PORT = process.env.PORT || 8080 // default port 8080

const cookieParser = require('cookie-parser')
app.use(cookieParser())

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs')

const urlsGenerate = require('./views/urlsGenerate') //local path to urlsGenerate function

//database set up
let urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
}
let usersDatabase = {
  "user1RandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "1111": {
     id: "1111",
     email: "1111email@example.com",
     password: "1111password"
   }
}

//routes
app.get('/urls', (req, res) => {
  res.render('urlsIndex', {
    urls: urlDatabase,
    userId: req.cookies.userId
  })
}) //base index! :)

app.get('/register', (req, res) => {
  res.render('register')
}) //registration page

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Yikes! Email/password invalid :(')
  }
  for (let user in usersDatabase) {
    if (usersDatabase[user].email === req.body.email) {
      res.status(400).send('Ooo - account already exists for this email!')
    }
  }
  const id = urlsGenerate()
  usersDatabase[id]= {}
  usersDatabase[id]['id'] = id
  usersDatabase[id]['email'] = req.body.email
  usersDatabase[id]['password'] = req.body.password
  res.cookie('userId', usersDatabase[id])
  res.redirect('/urls')
}) //collect the userId details

app.get('/urls/new', (req, res) => {
  res.render('urlsNew', {
    userId: req.cookies.userId
  })
}) //link to tiny-fy long URL

app.post('/urls', (req, res) => {
  console.log(req.body)  // debug statement to see POST parameters
  const shortURL = urlsGenerate()
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`)
}) //adds new short URL

app.post('/logout', (req, res) => {
  res.clearCookie('userId', req.cookies.userId)
  console.log(usersDatabase)
  res.redirect('urls')
})

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls')
}) //deleting a URL entry

app.post('/urls/:shortURL/update', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect('/urls')
}) //modify a URL entry

app.get('/urls/:id', (req, res) => {
  res.render('urlsShow', {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    userId: req.cookies.userId
  })
}) //display one individual URL info

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL)
}); //redirect to the actual site of longURL

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}!`)
})
