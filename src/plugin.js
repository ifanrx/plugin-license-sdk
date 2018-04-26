import config from './config'
import utils from './utils'

let plugin = global.plugin || {}

plugin._config = config

plugin.clearSession = () => {
  utils.storage.set('test', '')
}

export default plugin
