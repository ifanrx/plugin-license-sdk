import Plugin from './plugin'
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

function calculateSignature() {
  // ENCODED_LICENSE = BASE64(json_encode(license))
  // X-MiniApp-Plugin-Signature: {'appid': $APPID, 'license': ENCODED_LICENSE, 'nonce': $EIGHT_BYTE_RANDOM_STRING, 'signature': SHA256( sprintf("%s%s%s%s", APPID, ENCODED_LICENSE, APP_SECRET, EIGHT_BYTE_RANDOM_STRING) )}

}

export default function request({url, method = 'GET', data = {}, header = {}, dataType = 'json', isInnerRequest = false},) {
  return new Promise((resolve, reject) => {

    if (isInnerRequest) {
      // 内置请求不计算 X-MiniApp-Plugin-Signature
    } else {
      //
    }
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
        resolve(res)
      },
      fail: () => {
        utils.wxRequestFail(reject)
      }
    })

  })
}

/**
 * 内置请求
 * @param args
 */
export function innerRequest(args) {
  return request.call(this, extend(args, {isInnerRequest: true}))
}
