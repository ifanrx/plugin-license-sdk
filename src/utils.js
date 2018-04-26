import config from './config'
import PError from './PError'

export default {
  wxRequestFail: (reject) => {
    wx.getNetworkType({
      success: function(res) {
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
    } else  {
      errorMsg = res.data.error_msg || res.data.message || ''
    }
    return errorMsg
  },

  storage: {
    set: (key, value) => {
      wx.setStorageSync(config.STORAGE_KEY_PREFIX + key, value)
    },
    get: (key) => {
      return wx.getStorageSync(config.STORAGE_KEY_PREFIX + key)
    }
  }
}
