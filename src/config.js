let defaultConfig = {
  appId: '',
  pluginId: '',
  version: '',
  secretKey: '',
}

export class RuntimeConfig {
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

export default new RuntimeConfig()