generateRandomString = () => {
  const alphanumeric = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const nums = '0123456789'
  const id = []
  let counter = 0
  while (counter < 6) {
    id.push(alphanumeric[Math.floor(Math.random() * alphanumeric.length)])
    counter++
  }
  return id.join('');
}
module.exports = generateRandomString;
