import {requestWithoutSign} from './request'
import config from './config'
import constants from './constants'


/**
 * 获取插件信息
 * @returns {*}
 */
export function getLicense() {
  return requestWithoutSign({
    url: `${constants.API_HOST}/hserve/v1/license/?plugin_appid=${config.get('pluginId')}&appid=${config.get('appId')}`
  })
}

/**
 * 上报使用信息
 * @returns {*}
 */
export function reportUsage() {
  // TODO: 上报信息
  return Promise.resolve(true)
}