let defaultConfig = {
  storageKeyPrefix: 'ifx_plugin_license_',
  API_HOST: '',
  appId: '',
  pluginId: '',
  version: '',
  secretKey: '',
}

export class Config {
  constructor() {
    Object.keys(defaultConfig).forEach(key => {
      this[key] = defaultConfig[key]
    })
  }

  set(key, value) {
    this[key] = value
  }

  get(key) {
    return this[key]
  }
}

export default new Config()