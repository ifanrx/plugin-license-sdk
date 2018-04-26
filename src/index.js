import Plugin from './plugin'
import api from './api'
import makeRequest from './request'

api(Plugin)
makeRequest(Plugin)

module.exports = Plugin
