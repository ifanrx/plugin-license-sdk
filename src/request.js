import Plugin from './plugin'
import constants from './constants'
import {Promise} from 'rsvp'
import utils from './utils'
import extend from 'node.extend'

/**
 * 设置请求头
 * @param  {Object} header 自定义请求头
 * @return {Object}        扩展后的请求
 */
const buildInHeader = []
const setHeader = (header) => {
  let extendHeader = {} // 内置字段
  Object.keys(header).map(key => {
    if (buildInHeader.indexOf(key) !== -1) {
      delete header[key]
    }
  })
  return extend(header, extendHeader)
}

const request = ({ url, method = 'GET', data = {}, header = {}, dataType = 'json' }) => {
  return new Promise((resolve, reject) => {

    let headers = setHeader(header)

    if (!/https:\/\//.test(url)) {
      url = Plugin._config.API_HOST + url
    }

    wx.request({
      method: method,
      url: url,
      data: data,
      header: headers,
      dataType: dataType,
      success: res => {
        if (res.statusCode == constants.STATUS_CODE.UNAUTHORIZED) {
          Plugin.clearSession()
        }
        resolve(res)
      },
      fail: () => {
        utils.wxRequestFail(reject)
      }
    })

  })
}

export default function makeRequest(Plugin) {
  Plugin.request = request
}
