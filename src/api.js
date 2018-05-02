import {innerRequest} from './request'
import config from './config'

export function getLicence() {
  return innerRequest({
    url: `hserve/license/${config.get('pluginId')}/?appid=${config.get('appId')}`
  })
}
