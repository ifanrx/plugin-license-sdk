import test from 'ava'
import sinon from 'sinon'
import pluginSDK from '../src'
import constants from '../src/constants'
import request, {calculateSignature, innerRequest} from '../src/request'
import utils from '../src/utils'
import testConfig from './test-config'
import * as API from '../src/api'
import license from '../src/license'
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

let {appId, pluginId, secretKey, version, calculatedSign, randomString} = testConfig

test('#init', t => {
  let getLicenseStub = sinon.stub(API, 'getLicense').resolves({data: testConfig.license})
  return pluginSDK.init({appId, pluginId, secretKey, version}).then(() => {
    return pluginSDK.getLicense()
  }).then(licenseObject => {
    t.deepEqual(licenseObject, testConfig.license)
    return pluginSDK.isValid()
  }).then(valid => {
    t.true(valid)
    getLicenseStub.restore()
  })
})

// 测试请求发送， header 添加 SIGNATURE_KEY
test.cb('#test-request', t => {
  let requestStub = sinon.stub(wx, 'request').callsFake(function ({header}) {

    t.true(typeof header[constants.SIGNATURE_KEY] === 'string' && header[constants.SIGNATURE_KEY].length > 0)
    t.end()
  })

  request({})
  requestStub.restore()
})

// 测试内部请求，内部请求的 header 不添加 SIGNATURE_KEY
test.cb('#test-inner-request', t => {
  let requestStub = sinon.stub(wx, 'request').callsFake(function ({header}) {
    t.is(header[constants.SIGNATURE_KEY], undefined)
    t.end()
  })

  innerRequest({})
  requestStub.restore()
})

// 测试 localStorage
test('#test-storage', t => {
  let storageKey = 'test-key'
  let storageValue = 'test-value'

  utils.storage.set(storageKey, storageValue)

  t.is(utils.storage.get(storageKey), storageValue)
})

// 测试同样的数据，前后端计算的密钥是否相同
test('#test-signature', t => {
  let randomStub = sinon.stub(utils, 'randomString').returns(randomString)
  let sign = calculateSignature()
  t.is(JSON.parse(sign).signature, calculatedSign)
  randomStub.restore()
})

// 测试随机生成 8 位字符
test('#random-string', t => {
  t.regex(utils.randomString(), /\w{8}/)
})