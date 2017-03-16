urlsForId = (id, db) => {
  let urls = []
  for (url in db) {
    if (db[url].id === id) {
      urls.push(db[url])
    }
  }
  return urls
} //returns an array of urls for one user

module.exports = urlsForId;
