import constants from './constants'
import PError from './PError'

export default {
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
  }
}
