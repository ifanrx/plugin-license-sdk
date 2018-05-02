import {innerRequest} from './request'
import config from './config'

/**
 * 获取插件信息
 * @returns {*}
 */
export function getLicence() {
  return innerRequest({
    url: `hserve/license/${config.get('pluginId')}/?appid=${config.get('appId')}`
  })
}

/**
 * 上报使用信息
 * @returns {*}
 */
export function reportUsage() {
  return innerRequest({
    method: 'post',
    url: `hserve/license/${config.get('pluginId')}/launch/?appid=${config.get('appId')}`,
    data: {
      release: config.version,
      device: wx.getSystemInfoSync(),
    }
  })
}