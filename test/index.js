import test from 'ava'
import sinon from 'sinon'
import crypto from 'crypto'
import pluginSDK from '../src'
import constants from '../src/constants'
import request, {requestWithoutSign, LICENSE_EXPIRED_MSG} from '../src/request'
import utils from '../src/utils'
import testConfig from './test-config'
import * as API from '../src/api'
import moment from 'moment'

const noop = new Function()

let localStorageStore = {}

test.beforeEach(t => {
  localStorageStore = {}
  t.pass()
})

// mock
global.wx = {
  request: noop,
  setStorageSync: noop,
  getStorageSync: noop,
  removeStorageSync: noop,
}

sinon.stub(wx, 'getStorageSync').callsFake(function (key) {
  return localStorageStore[key]
})
sinon.stub(wx, 'setStorageSync').callsFake(function (key, value) {
  localStorageStore[key] = value
})
sinon.stub(wx, 'removeStorageSync').callsFake(function (key) {
  delete  localStorageStore[key]
})

sinon.stub(API, 'reportUsage').resolves('')

let {appId, pluginId, secretKey, version} = testConfig

test.serial('#init:normal', t => {
  sinon.stub(API, 'getLicense').resolves({statusCode: 200, data: testConfig.license.normal})
  return pluginSDK.init({appId, pluginId, secretKey, version}).then(() => {
    return pluginSDK.getLicense()
  }).then(licenseObject => {
    t.deepEqual(licenseObject, testConfig.license.normal)
    return pluginSDK.isValid()
  }).then(valid => {
    t.true(valid)
    API.getLicense.restore()
  })
})

test.serial('#init:server-return-expired-licence', t => {
  sinon.stub(API, 'getLicense').resolves({statusCode: 200, data: testConfig.license.expired})
  return pluginSDK.init({appId, pluginId, secretKey, version}).then(() => {
    return pluginSDK.getLicense()
  }).then(licenseObject => {
    t.deepEqual(licenseObject, testConfig.license.expired)
    return pluginSDK.isValid()
  }).then(valid => {
    t.false(valid)
    API.getLicense.restore()
  })
})

test.serial('#init:licence-cache-reach-next-check', t => {
  sinon.stub(API, 'getLicense').resolves({statusCode: 200, data: testConfig.license.normal})
  sinon.stub(utils.storage, 'get').withArgs(constants.LICENSE_STORAGE_KEY).returns(JSON.stringify(testConfig.license.reach_next_check))
  return pluginSDK.init({appId, pluginId, secretKey, version}).then(() => {
    return pluginSDK.getLicense()
  }).then(licenseObject => {
    t.deepEqual(licenseObject, testConfig.license.normal)
    return pluginSDK.isValid()
  }).then(valid => {
    utils.storage.get.restore()
    API.getLicense.restore()
    t.true(valid)
  })
})

test.serial('#expired-during-lifecycle', t => {
  let licenceObject = testConfig.license.pardon
  sinon.stub(utils.storage, 'get').withArgs(constants.LICENSE_STORAGE_KEY).returns(JSON.stringify(licenceObject))
  utils.storage.get.callThrough()
  return pluginSDK.init({appId, pluginId, secretKey, version}).then(() => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(pluginSDK.isValid())
      }, 1020) // licence 1000 毫秒后过期
    })
  }).then((valid) => {
    t.true(valid)
    t.true(moment.unix(pluginSDK._license.not_after).isBefore(moment())) // 实际上 license 已经过期了，进入 30 分钟宽限期
    t.true(moment.unix(utils.storage.get(constants.PARDON_TIME_KEY)).isValid())
    t.deepEqual(licenceObject, pluginSDK._license.format())
    utils.storage.get.restore()
  })
})

test.serial('#pardon-time-exceed-during-lifecycle', t => {
  // 这里复用上一个测试的状态
  constants.PARDON_TIME = 1 // 宽限期设置为 1 秒
  sinon.stub(utils.storage, 'get').withArgs(constants.PARDON_TIME_KEY).returns(moment().subtract(30, 'minutes').unix())
  utils.storage.get.callThrough()
  return pluginSDK.isValid().then(valid => {
    t.false(valid)
    utils.storage.get.restore()
  })
})

test.serial('#updateLicence:avoid-frequently-call', t => {
  sinon.stub(utils.storage, 'get')
    .withArgs(constants.LICENSE_STORAGE_KEY).returns(JSON.stringify(testConfig.license.normal))
    .withArgs(constants.LAST_FETCH_TIME).returns(moment().valueOf().toString())
  return pluginSDK.init({appId, pluginId, secretKey, version}).then(() => {
    return pluginSDK.updateLicense() // should using cache
  }).then(() => {
    return pluginSDK.getLicense()
  }).then(licenseObj => {
    t.deepEqual(licenseObj, testConfig.license.normal)
    utils.storage.get.restore()
  })
})

// 测试请求发送， header 添加 SIGNATURE_KEY
test.serial('#test-request-with-sign', t => {
  return new Promise((resolve) => {
    sinon.stub(utils.storage, 'get').withArgs(constants.LICENSE_STORAGE_KEY).returns(JSON.stringify(testConfig.license.normal))
    sinon.stub(utils, 'randomString').returns(testConfig.randomString)
    sinon.stub(wx, 'request').callsFake(function ({header}) {
      let signatureObject = JSON.parse(header[constants.SIGNATURE_KEY])
      let encoded = Buffer.from(JSON.stringify(testConfig.license.normal)).toString('base64')
      let hash = crypto.createHash('sha256').update(testConfig.appId + encoded + testConfig.secretKey + utils.randomString()).digest('hex')
      t.is(signatureObject.signature, hash)
      utils.storage.get.restore()
      utils.randomString.restore()
      resolve()
    })

    request({})
    wx.request.restore()
  })
})

// 测试内部请求，内部请求的 header 不添加 SIGNATURE_KEY
test.serial('#test-request-without-sign', t => {
  return new Promise((resolve) => {
    sinon.stub(wx, 'request').callsFake(function ({header}) {
      t.is(header[constants.SIGNATURE_KEY], undefined)
      resolve()
    })

    requestWithoutSign({})
    wx.request.restore()
  })
})

test.serial('#test-force-send', t => {
  const successData = 'ifanrx'
  return new Promise((resolve) => {
    sinon.stub(utils.storage, 'get').withArgs(constants.LICENSE_STORAGE_KEY).returns(JSON.stringify(testConfig.license.expired))
    pluginSDK.init({appId, pluginId, secretKey, version}).then(() => {
      sinon.stub(wx, 'request').yieldsTo('success', {statusCode: 200, data: successData})
      pluginSDK.isValid(valid => t.false(valid)).then(() => {
        request({forceSend: true}).then(res => {
          t.is(res.data, successData)
          wx.request.restore()
          utils.storage.get.restore()
          resolve()
        })
      })
    })
  })
})

test.serial('#test-disable-force-send', t => {
  return new Promise((resolve) => {
    sinon.stub(utils.storage, 'get').withArgs(constants.LICENSE_STORAGE_KEY).returns(JSON.stringify(testConfig.license.expired))
    // 宽限期
    utils.storage.get.withArgs(constants.PARDON_TIME_KEY).returns(JSON.stringify(moment().subtract(60, 'minutes').unix()))
    pluginSDK.init({appId, pluginId, secretKey, version}).then(() => {
      pluginSDK.isValid(valid => t.false(valid)).then(() => {
        request({}).catch(err => {
          t.is(err.message, LICENSE_EXPIRED_MSG)
          utils.storage.get.restore()
          resolve()
        })
      })
    })
  })
})

// 测试随机生成 8 位字符
test.serial('#random-string', t => {
  t.regex(utils.randomString(), /\w{8}/)
})