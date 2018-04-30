class License {
  constructor() {}

  _init(license) {
    Object.keys(license).map(key => {
      this[key] = license[key]
    })
    const now = new Date().getTime()
    this._isValid = this.not_after - now >= 0
    this._updateAt = now
  }
}

export default new License()
