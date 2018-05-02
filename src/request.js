import Promise from 'promise-light'
import utils from './utils'
import config from './config'
import constants from './constants'
import license from './license'
import {btoa} from 'Base64'
import sha256 from 'hash.js/lib/hash/sha/256'

export function calculateSignature() {
  let encoded = btoa(JSON.stringify(license.format()))
  let randomSting = utils.randomString()
  let appId = config.appId
  let secretKey = config.secretKey
  let signature = JSON.stringify({
    'appid': appId,
    'license': encoded,
    'nonce': randomSting,
    'signature': sha256().update(appId + encoded + secretKey + randomSting).digest('hex')
  })

  return signature
}

/**
 * 发起请求
 * @param url
 * @param method
 * @param data
 * @param header
 * @param dataType
 * @param isInnerRequest 是否为知晓云请求，如果为 true，则不计算 Signature
 */
export default function request({url, method = 'GET', data = {}, header = {}, dataType = 'json', complete, isInnerRequest = false}) { // eslint-disable-line
  return new Promise((resolve, reject) => {

    if (!isInnerRequest) {
      // 内置请求不计算 X-MiniApp-Plugin-Signature
      header = Object.assign(header, {[constants.SIGNATURE_KEY]: calculateSignature()})
    }

    if (!/https:\/\//.test(url)) {
      url = config.get('API_HOST') + url
    }

    wx.request({
      method: method,
      url: url,
      data: data,
      header,
      dataType: dataType,
      success: res => {
        resolve(res)
      },
      fail: () => {
        utils.wxRequestFail(reject)
      },
      complete,
    })

  })
}

/**
 * 内置请求
 * @param args
 */
export function innerRequest(args) {
  return request.call(this, Object.assign(args, {isInnerRequest: true}))
}


