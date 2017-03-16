'use strict'

//set up
const express = require('express')
const app = express()
app.set('view engine', 'ejs')

const morgan = require('morgan')
app.use(morgan('dev'))

const PORT = process.env.PORT || 8080 // default port 8080

const cookieParser = require('cookie-parser')
app.use(cookieParser())

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

const bcrypt = require('bcrypt')

app.set('view engine', 'ejs')

const urlsGenerate = require('./views/urlsGenerate') //local path to urlsGenerate function

//database set up
let urlsDatabase = {
  'b2xVn2': {
    shortURL: 'b2xVn2',
    id: '111',
    longURL: 'http://www.lighthouselabs.ca'
  },
  '9sm5xK': {
    shortURL: '9sm5xK',
    id: '111',
    longURL: 'http://www.google.com'
  },
  '8wo1m5': {
    shortURL: '8wo1m5',
    id: '222',
    longURL: 'http://github.com'
  }
}

let usersDatabase = {
  '111': {
    id: '111',
    email: '111@email.com',
    password: bcrypt.hashSync('111password', 10)
  },
  '222': {
    id: '222',
    email: '222@email.com',
    password: bcrypt.hashSync('222password', 10)
  }
}

//helper functions set up
let urlsForId = (id) => {
  let urls = []
  for (let url in urlsDatabase) {
    if (urlsDatabase[url].id === id) {
      urls.push(urlsDatabase[url])
    }
  }
  return urls
} //returns array of urls for one user

//routes
app.get('/urls', (req, res) => {
  let tempVars = {
    userId: req.cookies.userId
  }
  if (req.cookies.userId) {
    tempVars['urls'] =  urlsForId(req.cookies.userId.id)
  }
  res.render('urlsIndex', tempVars)
}) //base index! :)

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', (req, res) => {
  const enteredEmail = req.body.email
  const enteredPassword = req.body.password
  for (let user in usersDatabase) {
    if (usersDatabase[user].email === enteredEmail && bcrypt.compareSync(enteredPassword, usersDatabase[user].password)) {
      res.cookie('userId', usersDatabase[user])
      res.redirect('/urls')
    } else if (usersDatabase[user].email === enteredEmail && usersDatabase[user].password !== enteredPassword) {
      res.status(403).send('Oops. Incorrect password.')
    }
  }
  res.status(403).send('Sorry. Invalid email!')
}) //check against database for user log in

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
  usersDatabase[id]['password'] = bcrypt.hashSync(req.body.password, 10) //////////
  res.cookie('userId', usersDatabase[id])
  res.redirect('/urls')
}) //collect user's registration details

app.get('/urls/new', (req, res) => {
  if (!req.cookies.userId) {
    res.redirect('/login')
  }
  res.render('urlsNew', {
    userId: req.cookies.userId
  })
}) //link to tiny-fy long URL

app.post('/urls', (req, res) => {
  console.log(req.body)  // debug statement to see POST parameters
  const id = req.cookies.userId.id
  const shortURL = urlsGenerate()
  urlsDatabase[shortURL] = {
    shortURL: shortURL,
    id: id,
    longURL: req.body.longURL
  }
  res.redirect(`/urls/${shortURL}`)
}) //adds new short URL

app.post('/logout', (req, res) => {
  res.clearCookie('userId', req.cookies.userId)
  console.log(usersDatabase)
  res.redirect('/urls')
}) //logs out of account

app.post('/urls/:id/delete', (req, res) => {
  delete urlsDatabase[req.params.id]
  res.redirect('/urls')
}) //deleting a URL entry

app.post('/urls/:shortURL/update', (req, res) => {
  urlsDatabase[req.params.shortURL].longURL = req.body.longURL
  res.redirect('/urls')
}) //modify a URL entry

app.get('/urls/:id', (req, res) => {
  res.render('urlsShow', {
    shortURL: req.params.id,
    longURL: urlsDatabase[req.params.id].longURL,
    userId: req.cookies.userId
  })
}) //display one individual URL info

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlsDatabase[req.params.shortURL].longURL
  res.redirect(longURL)
}) //redirect to the actual site of longURL

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}!`)
})
