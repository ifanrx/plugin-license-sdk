const moment = require('moment')

module.exports = {
  appId: 'test-appId',
  version: '1.0.0',
  pluginId: 'test-pluginId',
  secretKey: 'test-secretKey',
  randomString: 'abcdefgh',
  license: {
    normal: {
      'not_before': moment().subtract(1, 'days').unix(),
      'not_after': moment().add(1, 'days').unix(),
      'next_check': moment().add(1, 'days').unix(),
      'cooldown': 600,
      'plan_type': 'FREE',
      'capabilities': ['$cap'],
      'userdata': '$userdata',
      status: 'normal',
    },
    expired: {
      'not_before': moment().subtract(1, 'days').unix(),
      'not_after': moment().subtract(1, 'days').unix(),
      'next_check': moment().add(1, 'hour').unix(),
      'cooldown': 600,
      'plan_type': 'FREE',
      'capabilities': ['$cap'],
      'userdata': '$userdata',
      status: 'new',
    },
    reach_next_check: { // 未过期，但需要重新拉取数据
      'not_before': moment().subtract(1, 'days').unix(),
      'not_after': moment().add(1, 'days').unix(),
      'next_check': moment().subtract(1, 'days').unix(),
      'cooldown': 600,
      'plan_type': 'FREE',
      'capabilities': ['$cap'],
      'userdata': '$userdata',
      status: 'normal',
    },
    get pardon() {
      return {
        'not_before': moment().subtract(1, 'days').unix(),
        'not_after': moment().unix(),
        'next_check': moment().add(1, 'days').unix(),
        'cooldown': 600,
        'plan_type': 'FREE',
        'capabilities': ['$cap'],
        'userdata': '$userdata',
        status: 'normal',
      }
    }
  },
}