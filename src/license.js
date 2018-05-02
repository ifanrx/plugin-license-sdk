import utils from './utils'
import constants from './constants'
import * as API from './api'

let licenseKeys = ['not_before', 'not_after', 'next_check', 'cooldown', 'plan_type', 'capabilities', 'userdata']

class License {
  updateInstance(license) {
    Object.keys(license).forEach(key => {
      this[key] = license[key]
    })
    const now = utils.now()
    this._isValid = this.not_after - now >= 0
  }


  getLicenseFromStorage() {
    let licenseStr = utils.storage.get(constants.LICENSE_STORAGE_KEY)
    if (licenseStr) {
      let license = JSON.parse(licenseStr)
      this.updateInstance(license)
      return license
    } else {
      return null
    }
  }

  getLicenseFromServer() {
    return API.getLicense().then(res => {
      utils.storage.set(constants.LAST_FETCH_TIME, Date.now())
      this.updateInstance(res.data)
      this.saveToStorage(res.data)
      return res.data
    })
  }

  get _updateAt() {
    return parseInt(utils.storage.get(constants.LAST_FETCH_TIME))
  }


  format() {
    let ret = {}
    licenseKeys.forEach(key => {
      ret[key] = this[key]
    })
    return ret
  }

  saveToStorage(licenseObjecct) {
    utils.storage.set(constants.LICENSE_STORAGE_KEY, JSON.stringify(licenseObjecct))
  }
}

export default new License()
