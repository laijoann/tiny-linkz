'use strict';

//set up
const express = require('express')
const app = express()
app.set('view engine', 'ejs')

const morgan = require('morgan')
app.use(morgan('dev'))

const PORT = process.env.PORT || 8080 // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs')

const urlsGenerate = require('./views/urlsGenerate') //local path to urlsGenerate function

let urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
}

app.get('/urls/new', (req, res) => {
  res.render('urlsNew')
}) //link to tiny-fy long URL

app.post('/urls', (req, res) => {
  console.log(req.body)  // debug statement to see POST parameters
  let shortURL = urlsGenerate(req.body.longURL)
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`)
}) //adds new short URL

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase }
  res.render('urlsIndex', templateVars)
}) //base index! :)

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls')
}) //deleting a URL entry

app.post('/urls/:shortURL/update', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect('/urls')
}) //modify a URL entry

app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] }
  res.render('urlsShow', templateVars)
}) //display one individual URL info

app.get('/u/:shortURL', (req, res) => {
  // let longURL = ...
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL)
}); //redirect to the actual site of longURL

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}!`)
})