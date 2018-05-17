import constants from './constants'
import PError from './PError'

module.exports = {
  wxRequestFail: (reject) => {
    wx.getNetworkType({
      success: function (res) {
        if (res.networkType === 'none') {
          reject(new PError(600)) // 断网
        } else {
          reject(new PError(601)) // 网络超时
        }
      }
    })
  },

  extractErrorMsg: (res) => {
    let errorMsg = ''
    if (res.statusCode === 404) {
      errorMsg = 'not found'
    } else {
      errorMsg = res.data.error_msg || res.data.message || ''
    }
    return errorMsg
  },

  storage: {
    set: (key, value) => {
      let str = ''
      if (typeof value === 'object') {
        str = JSON.stringify(value)
      } else {
        str = value.toString()
      }
      wx.setStorageSync(constants.STORAGE_PREFIX_KEY + key, str)
    },
    get: (key) => {
      return wx.getStorageSync(constants.STORAGE_PREFIX_KEY + key)
    },
    remove: (key) => wx.removeStorageSync(constants.STORAGE_PREFIX_KEY + key)
  },

  randomString() {
    return Math.random().toString(36).substring(2, 10)
  },
  now() {
    return Math.floor(Date.now() / 1000)
  },
  checkPardon(now) {
    const pardonTime = module.exports.storage.get(constants.PARDON_TIME_KEY)
    if (!pardonTime) {
      module.exports.storage.set(constants.PARDON_TIME_KEY, now)
      return true
    } else if ((parseInt(pardonTime) || 0) + constants.PARDON_TIME < now) {
      module.exports.storage.remove(constants.PARDON_TIME_KEY)
      return false
    } else {
      return true
    }
  }

}
