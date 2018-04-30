import {innerRequest} from './request'
import config from './config'

const getLicense = () => {
  return innerRequest({
    url: `hserve/license/${config.get('pluginId')}/?appid=${config.get('appId')}`
  })
}

export default {
  getLicense,
}
