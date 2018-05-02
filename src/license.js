import utils from './utils'
import constants from './constants'
import * as API from './api'

class License {
  init(license) {
    Object.keys(license).forEach(key => {
      this[key] = license[key]
    })
    const now = new Date().getTime()
    this._isValid = this.not_after - now >= 0
  }


  getLicenceFromStorage() {
    let licenceStr = utils.storage.get(constants.LICENCE_STORAGE_KEY)
    if (licenceStr) {
      return JSON.parse(licenceStr)
    } else {
      return null
    }
  }

  getLicenceFromServer() {
    utils.storage.set(constants.LAST_FETCH_TIME, Date.now())
    return API.getLicence().then(res => {
      return res.data
    })
  }

  get updateAt() {
    return parseInt(utils.storage.get(constants.LAST_FETCH_TIME))
  }
}

export default new License()
