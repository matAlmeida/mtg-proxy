const axios = require('axios')

const api = axios.create({
  baseURL: 'https://api.scryfall.com/cards/named?fuzzy='
})

module.exports = api
