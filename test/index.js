import test from 'ava'
import sinon from 'sinon'
import crypto from 'crypto'
import pluginSDK from '../src'
import constants from '../src/constants'
import request, {innerRequest} from '../src/request'
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

test.cb.beforeEach(t => {
  localStorageStore = {}
  t.end()
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

let getLicenseStub = sinon.stub(API, 'getLicense')

let {appId, pluginId, secretKey, version} = testConfig

getLicenseStub.onCall(0).resolves({statusCode: 200, data: testConfig.license.normal})
test.serial('#init:normal', t => {
  return pluginSDK.init({appId, pluginId, secretKey, version}).then(() => {
    return pluginSDK.getLicense()
  }).then(licenseObject => {
    t.deepEqual(licenseObject, testConfig.license.normal)
    return pluginSDK.isValid()
  }).then(valid => {
    t.true(valid)
  })
})

getLicenseStub.onCall(1).resolves({statusCode: 200, data: testConfig.license.expired})
test.serial('#init:expired', t => {
  return pluginSDK.init({appId, pluginId, secretKey, version}).then(() => {
    return pluginSDK.getLicense()
  }).then(licenseObject => {
    t.deepEqual(licenseObject, testConfig.license.expired)
    return pluginSDK.isValid()
  }).then(valid => {
    t.false(valid)
  })
})

getLicenseStub.onCall(2).resolves({statusCode: 200, data: testConfig.license.normal})
test.serial('#init:reach_next_check', t => {
  sinon.stub(utils.storage, 'get').withArgs(constants.LICENSE_STORAGE_KEY).returns(JSON.stringify(testConfig.license.reach_next_check))
  return pluginSDK.init({appId, pluginId, secretKey, version}).then(() => {
    return pluginSDK.getLicense()
  }).then(licenseObject => {
    t.deepEqual(licenseObject, testConfig.license.normal)
    return pluginSDK.isValid()
  }).then(valid => {
    utils.storage.get.restore()
    t.true(valid)
  })
})


test.serial('#updateLicence:avoid_frequently_call', t => {
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
test.serial('#test-request', t => {
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
test.serial('#test-inner-request', t => {
  return new Promise((resolve) => {
    sinon.stub(wx, 'request').callsFake(function ({header}) {
      t.is(header[constants.SIGNATURE_KEY], undefined)
      resolve()
    })

    innerRequest({})
    wx.request.restore()
  })
})


// 测试随机生成 8 位字符
test('#random-string', t => {
  t.regex(utils.randomString(), /\w{8}/)
})