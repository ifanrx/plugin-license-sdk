import utils from './utils'
import constants from './constants'
import * as API from './api'

let licenceKeys = ['not_before', 'not_after', 'next_check', 'cooldown', 'plan_type', 'capabilities', 'userdata']

class License {
  updateInstance(license) {
    Object.keys(license).forEach(key => {
      this[key] = license[key]
    })
    const now = utils.now()
    this._isValid = this.not_after - now >= 0
  }


  getLicenceFromStorage() {
    let licenceStr = utils.storage.get(constants.LICENCE_STORAGE_KEY)
    if (licenceStr) {
      let license = JSON.parse(licenceStr)
      this.updateInstance(license)
      return license
    } else {
      return null
    }
  }

  getLicenceFromServer() {
    return API.getLicence().then(res => {
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
    licenceKeys.forEach(key => {
      ret[key] = this[key]
    })
    return ret
  }

  saveToStorage(licenceObjecct) {
    utils.storage.set(constants.LICENCE_STORAGE_KEY, JSON.stringify(licenceObjecct))
  }
}

export default new License()
