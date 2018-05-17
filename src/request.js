import Promise from 'promise-light'
import utils from './utils'
import config from './config'
import constants from './constants'
import license from './license'
import {btoa} from 'Base64'
import sha256 from 'hash.js/lib/hash/sha/256'

export const LICENSE_EXPIRED_MSG = 'license 已过期'

export function calculateSignature() {
  let encoded = btoa(JSON.stringify(license.format()))
  let randomString = utils.randomString()
  let appId = config.appId
  let secretKey = config.secretKey
  let signature = JSON.stringify({
    'appid': appId,
    'license': encoded,
    'nonce': randomString,
    'signature': sha256().update(appId + encoded + secretKey + randomString).digest('hex')
  })

  return signature
}

/**
 * 发起请求
 * @param url
 * @param method
 * @param data
 * @param header`
 * @param dataType
 * @param forceSend 当 license 失效时，是否强制发送请求
 */
export function innerRequest({url, method = 'GET', data = {}, header = {}, dataType = 'json', complete, forceSend = false}) { // eslint-disable-line
  return new Promise((resolve, reject) => {
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

export default function request(args = {}) {
  let {header = {}, forceSend = false} = args
  if (!forceSend && !license._isValid && !utils.checkPardon(utils.now())) {
    return Promise.reject(new Error(LICENSE_EXPIRED_MSG))
  }
  let customHeader = Object.assign(header, {[constants.SIGNATURE_KEY]: calculateSignature()})
  return innerRequest.call(this, Object.assign(args, {header: customHeader}))
}

/**
 * 内置请求
 * @param args
 */
export function requestWithoutSign(args) {
  return innerRequest.call(this, args)
}


