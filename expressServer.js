'use strict';

//set up
const express = require('express')
const app = express()

app.set('view engine', 'ejs')

const morgan = require('morgan')
app.use(morgan('dev'))

const PORT = process.env.PORT || 8080 // default port 8080

const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  secret: 'cookieKey'
}))

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

const bcrypt = require('bcrypt')

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

//helper functions set up
const urlsGenerate = require('./urlsGenerate')
const urlsForId = require('./urlsForId')

let loginAuth = (cookieEmail, cookiePassword, db) => {
  for (let user in db) {
    const emailCheck = db[user].email === cookieEmail
    const pwCheck = bcrypt.compareSync(cookiePassword, db[user].password)
    if (emailCheck && pwCheck) {
      return {
        val: true,
        user: db[user]
      }
    } else if (emailCheck && !pwCheck) {
      return { val: 'wrongPw' }
    }
  }
  return { val: 'invalidEmail' }
}

let registerCheck = (db, email) => {
  for (let user in db) {
    if (db[user].email === email) {
      return false
    }
  }
  return true
}

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

//routes
app.get('/', (req, res) => {
  if (req.session.userId) {
      res.redirect('/urls')
  } else {
    res.redirect('/login')
  }
}) //base index! :)

app.get('/urls', (req, res) => {
  if (!req.session.userId) {
    res.status(401).send('Please sign in first!')
  } else {
    let tempVars = {
      userId: req.session.userId,
      urls: urlsForId(req.session.userId.id, urlsDatabase)
    }
    res.render('urlsIndex', tempVars)
  }
})

app.get('/login', (req, res) => {
  if (!req.session.userId) {
    res.render('login')
  } else {
    res.redirect('/')
  }
})

app.post('/login', (req, res) => {
  const cookieEmail = req.body.email
  const cookiePassword = req.body.password
  const check = loginAuth(cookieEmail, cookiePassword, usersDatabase)
  console.log(check)
  if (check.val === true) {
    console.log(check)
    req.session.userId = check.user
    res.redirect('/')
  } else if (check.val === 'wrongPw') {
    res.status(403).send('Oops. Incorrect password.')
  } else if (check.val === 'invalidEmail') {
    res.status(403).send('Oops. This email isn\'t registered for an account yet!')
  } else {
    res.status(403).send('Yikes! Something went wrong. Please try again.')
  }
}) //check against database for user log in

app.get('/register', (req, res) => {
  if (!req.session.userId) {
    res.render('register')
  } else {
    res.redirect('/')
  }
}) //registration page

app.post('/register', (req, res) => {
  const check = registerCheck(usersDatabase, req.body.email)
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Yikes! Email/password invalid :(')
  } else if (!check) {
    res.status(400).send('Ooo - account already exists for this email.')
  } else {
    const id = urlsGenerate()
    usersDatabase[id]= {}
    usersDatabase[id]['id'] = id
    usersDatabase[id]['email'] = req.body.email
    usersDatabase[id]['password'] = bcrypt.hashSync(req.body.password, 10)
    req.session.userId = usersDatabase[id]
    res.redirect('/')
  }
}) //collect user's registration details

app.get('/urls/new', (req, res) => {
  if (!req.session.userId) {
    res.redirect('/login')
  }
  res.render('urlsNew', {
    userId: req.session.userId
  })
}) //link to tiny-fy long URL

app.post('/urls', (req, res) => {
  console.log(req.body)  // debug statement to see POST parameters
  const id = req.session.userId.id
  const shortURL = urlsGenerate()
  urlsDatabase[shortURL] = {
    shortURL: shortURL,
    id: id,
    longURL: req.body.longURL
  }
  res.redirect(`/urls/${shortURL}`)
}) //adds new short URL

app.post('/logout', (req, res) => {
  req.session = null
  // res.clearCookie('userId', req.session.userId)
  console.log(usersDatabase)
  res.redirect('/login')
}) //logs out of account

app.delete('/urls/:id', (req, res) => {
  delete urlsDatabase[req.params.id]
  res.redirect('/')
}) //deleting a URL entry

app.post('/urls/:shortURL/update', (req, res) => {
  urlsDatabase[req.params.shortURL].longURL = req.body.longURL
  res.redirect('/')
}) //modify a URL entry

app.get('/urls/:id', (req, res) => {
  if (!urlsDatabase[req.params.id]) {
    res.status(404).send('Hmm, this tiny link doesn\'t exist yet!')
  } else if (!req.session.userId) {
    res.status(401).send('Please log in to view your tiny link :)')
  } else if (req.session.userId.id !== urlsDatabase[req.params.id].id) {
    res.status(403).send('Eh? This doesn\'t seem to be your tiny link..')
  } else {
    res.render('urlsShow', {
      shortURL: req.params.id,
      longURL: urlsDatabase[req.params.id].longURL,
      userId: req.session.userId
    })
  }
}) //display one individual URL info

app.get('/u/:shortURL', (req, res) => {
  if (!urlsDatabase[req.params.shortURL]) {
    res.status(404).send('Hm, this tiny link doesn\'t exist :(')
  } else {
    res.redirect(urlsDatabase[req.params.shortURL].longURL)
  }
}) //redirect to the actual site of longURL

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}!`)
})
