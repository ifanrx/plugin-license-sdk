import test from 'ava'
import sinon from 'sinon'
import pluginSDK from '../src'
import constants from '../src/constants'
import request, {calculateSignature, innerRequest} from '../src/request'
import utils from '../src/utils'
import testConfig from './test-config'

const noop = new Function()

// mock
global.wx = {
  request: noop,
  setStorageSync: noop,
  getStorageSync: noop,
}

let {appId, pluginId, secretKey, version, calculatedSign, randomString} = testConfig

test.before(() => {
  pluginSDK.init({appId, pluginId, secretKey, version})
})

// 第一次初始化，不存在任何的缓存
test('#first-init', t => {
  let localStorageStore = {}
  let getLicence = sinon.stub(pluginSDK, 'getLicence').resolves('asdasd')

  let getStub = sinon.stub(wx, 'getStorageSync').callsFake(function (key) {
    return localStorageStore[key]
  })

  let requestStub = sinon.stub(wx, 'request').callsFake(function ({header}) {

  })

  t.pass()
})

// 初始化，无权限
test('#init-failed', t => {
  t.pass()
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
  let localStorageStore = {}
  let storageKey = 'test-key'
  let storageValue = 'test-value'

  let setStub = sinon.stub(wx, 'setStorageSync').callsFake(function (key, value) {
    localStorageStore[key] = value
  })
  let getStub = sinon.stub(wx, 'getStorageSync').callsFake(function (key) {
    return localStorageStore[key]
  })

  utils.storage.set(storageKey, storageValue)

  t.is(utils.storage.get(storageKey), storageValue)

  setStub.restore()
  getStub.restore()
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