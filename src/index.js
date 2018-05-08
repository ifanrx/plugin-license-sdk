import _request from './request'
import license from './license'
import {defer} from 'promise-light'
import config from './config'
import utils from './utils'
import constants from './constants'
import {reportUsage} from './api'

const thirtyMinutesToSeconds = 30 * 60

export class PluginSDK {
  constructor() {
    this.deferred = defer()
    this._license = license
  }

  /**
   * 初始化插件
   * @param args
   * @returns {Promise<void>}
   */
  init(args) {
    // 避免重复加载
    let argsList = ['appId', 'pluginId', 'secretKey', 'version']

    for (let i = 0; i < argsList.length; i++) {
      let v = args[argsList[i]]
      if (!v) {
        throw new Error(`need param ${argsList[i]}`)
      }

      config.set(argsList[i], v)
    }

    const storageLicense = license.getLicenseFromStorage()
    let p = Promise.resolve()
    if (!storageLicense) {
      p = license.getLicenseFromServer()
    }
    return p.then(() => reportUsage()).then(() => this._isReachNextCheck().then(() => this.deferred.resolve()))
  }

  /**
   * 插件鉴权
   * @returns {PromiseLike<any>}
   */
  isValid() {
    return this.deferred.promise.then(() => {
      // _isValid 是在 License.init() 设置的，需要再次判断缓存中的 no_after || 30 分钟宽限期
      if (this._license._isValid) {
        return this._isReachNextCheck().then(() => {
          return this._isExpired()
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
      if ((this._license._updateAt + this._license.cooldown) > new Date().getTime()) { // 根据 cool down 避免高频调用
        license.getLicenseFromStorage()
      } else {
        return license.getLicenseFromServer()
      }
    })
  }

  getLicense() {
    return this._isReachNextCheck()
  }

  getPlanType() {
    return this._license.planType
  }

  isPaidPlan() {
    let {planType} = this._license
    return planType === constants.PLAN_TYPE.COMMERCIAL || planType === constants.PLAN_TYPE.FREEMIUM
  }

  haveCapability() {
    return null

  }

  getUserData() {
    return null
  }

  /**
   * 检测是否超过 next check 时间，若超过请求接口
   * @returns {*}
   * @private
   */
  _isReachNextCheck() {
    const now = utils.now()
    if (!!this._license.next_check && parseInt(this._license.next_check) - now <= 0) {
      return license.getLicenseFromServer()
    }
    return Promise.resolve(this._license.format())
  }

  /**
   * 检测权限
   * @description 只有 init 为 true 的情况下才会进入这里
   * @returns {boolean}
   * @private
   */
  _isExpired() {
    const now = utils.now()
    // 是否是宽限期
    const pardonTime = parseInt(utils.storage.get(constants.PARDON_TIME_KEY))
    if (this._license.not_after >= now) {
      return true
    } else if (!pardonTime) {
      utils.storage.set(constants.PARDON_TIME_KEY, now)
      return true
    } else if (pardonTime + thirtyMinutesToSeconds < now) {
      this._license._isValid = false
      utils.storage.remove(constants.PARDON_TIME_KEY)
      return false
    } else {
      return true
    }
  }
}

module.exports = new PluginSDK()
