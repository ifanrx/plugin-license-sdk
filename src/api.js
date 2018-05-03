import {innerRequest} from './request'
import config from './config'
import constants from './constants'


/**
 * 获取插件信息
 * @returns {*}
 */
export function getLicense() {
  return innerRequest({
    url: `${constants.API_HOST}/hserve/v1/miniapp-plugin/license/${config.get('pluginId')}/`,
    header: {
      AppID: config.get('appId')
    }
  })
}

/**
 * 上报使用信息
 * @returns {*}
 */
export function reportUsage() {
  return Promise.resolve(true)
  // return innerRequest({
  //   method: 'post',
  //   url: `hserve/license/${config.get('pluginId')}/launch/?appid=${config.get('appId')}`,
  //   data: {
  //     release: config.version,
  //     device: wx.getSystemInfoSync(),
  //     // sdk_version: process.env.version // TODO: 上报 sdk 版本
  //   }
  // })
}