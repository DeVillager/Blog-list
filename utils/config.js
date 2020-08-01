let x = require('dotenv').config()

// console.log(process.env.NODE_ENV)
let PORT = process.env.PORT
let MONGODB_URI = process.env.MONGODB_URI

if (process.env.NODE_ENV === 'test') {
  MONGODB_URI = process.env.TEST_MONGODB_URI
}

console.log(`mongodb path: ${MONGODB_URI}`)
module.exports = {
  MONGODB_URI,
  PORT
}