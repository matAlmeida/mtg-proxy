const axios = require('axios')

const api = axios.create({
  baseURL: 'https://api.scryfall.com'
})

module.exports = api
