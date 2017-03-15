generateRandomString = () => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const id = []
  let counter = 0
  while (counter < 6) {
    id.push(charset[Math.floor(Math.random() * charset.length)])
    counter++
  }
  return id.join('');
}

module.exports = generateRandomString;