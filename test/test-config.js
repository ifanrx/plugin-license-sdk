module.exports = {
  appId: 'test-appId',
  version: '1.0.0',
  pluginId: 'test-pluginId',
  secretKey: 'test-secretKey',
  randomString: 'abcdefgh',
  license: {
    'not_before': 1515244875,
    'not_after': 1625244875,
    'next_check': 1695244875,
    'cooldown': 600,
    'plan_type': 'FREE',
    'capabilities': ['$cap'],
    'userdata': '$userdata'
  },
  calculatedSign: '6aa1a3e8f0466a0fae52504a3bef3cc431b93e4e16082b41f176ed48fecfc30c' // 服务端使用相同算法计算得出的 sign
}