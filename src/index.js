import _request from './request'
import license from './license'
import {defer} from 'promise-light'
import config from './config'
import utils from './utils'

const thirtyMinutesToSeconds = 30 * 60

class PluginSDK {
  constructor() {
    this.deferred = defer()
    this._license = license
  }

  init(args) {
    let argsList = ['appId', 'pluginId', 'version', 'secretKey']

    for (let i = 0; i < argsList.length; i++) {
      let v = args[argsList[i]]
      if (!v) {
        throw new Error(`need param ${argsList[i]}`)
      }

      config.set(argsList[i], v)
    }

    // check cooldown

    // check expired
    const storageLicense = license.getLicenceFromStorage()
    let p = Promise.resolve()
    if (!storageLicense) {
      p = license.getLicenceFromServer().then(licenseObject => {
        this._license.init(licenseObject)
      })
    } else {
      this._license._init(storageLicense)
    }

    return p.then(() => this._checkLicense().then(() => this.deferred.resolve()))
  }

  isValid() {
    const now = new Date().getTime()
    return this.deferred.promise.then(() => {
      if (this._license._isValid) {
        return this._checkLicense().then(() => {
          return this._checkIsVail()
        })
      }
      return false
    })
  }

  request() {
    return _request.apply(this, arguments)
  }

  updateLicense() {
    return this.deferred.promise.then(() => {
      if ((this._license._updateAt + this._license.cool_down) > new Date().getTime()) {
        return this._getLicense()
      } else {
        return this._getLicense(true)
      }
    })
  }

  getLicense() {
    return this.deferred.promise.then(() => {
      return this._getLicense()
    })
  }

  getPlanType() {

  }

  isPaidPlan() {

  }

  haveCapability() {

  }

  getUserData() {

  }

  _getLicense(force = false) {
    if (force) {
      // license
    } else {
      return Promise.resolve(utils.storage.get('license'))
    }
  }


  // 检测是否超过 next check 时间，若超过请求接口
  _checkLicense() {
    const now = utils.now()
    if (!!this._license.next_check && parseInt(this._license.next_check) - now <= 0) {
      return license.getLicenceFromServer()
    }
    return Promise.resolve(this._license)
  }

  _checkIsVail() {
    const now = new Date().getTime()
    const storageRecord = utils.storage.get('expired_at')
    if (this._license.not_after >= now) {
      return true
    } else if (!storageRecord) {
      utils.storage.set('expired_at', now)
      return true
    } else if (storageRecord + thirtyMinutesToSeconds < now) {
      this._license._isValid = false
      return false
    } else {
      return true
    }
  }
}

module.exports = new PluginSDK()
