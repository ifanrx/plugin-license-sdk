# plugin-license-sdk

## 接入
```js
// 在插件代码中引入 sdk
var sdk = require('sdk-v1.0.0.js')

// 初始化
// 插件开发者需要暴露一个初始化接口给用户，用于获取用户的小程序 id
// sdk 的后续操作必须在 init 操作 resolve 后
var initPromise = sdk.init({ appId: 'test', pluginId: 'test', secretKey: 'test', version: '1.2.1' })

// 初始化完成，判断用户是否有权限使用插件
sdk.isValid().then(valid => { console.log(valid) })

// 开发者可以根据需要主动更新 licence
sdk.updateLicence().then(() => { console.log('success') })

// 获取当前 license 数据
sdk.getLicence().then(licence => { console.log(licence) })

// 发送请求，开发者可以对请求进行鉴权
sdk.request({ url: 'https://xiaoapp.io' }).then(res => { console.log(res) }).catch(err => { console.log(err) })
```

## secret key
开发者可以在知晓程序插件市场的 [控制台-发布管理](https://minapp.com/plugin/console/#/management/publish-plugin/) 找到 secret key
## API

### sdk.init({ appId, pluginId, secretKey, version })
初始化 license sdk

#### 参数

|参数名|类型|说明|
|------|----|----|
| appId | String| 小程序 id |
| pluginId | String | 插件 id |
| secretKey | String | 插件密钥 |
| version | String | 插件版本 |

#### 返回值
`Promise.<null>`

### sdk.isValid()
license 是否还有效

#### 参数

无

#### 返回值
`Promise.<true|false>`

### sdk.updateLicense()
强制更新 license

#### 参数

无

#### 返回值
`Promise.<null>`

### sdk.getLicense()
获取 license

#### 参数

无

#### 返回值
`Promise.<licenseObject>`

licenseObject说明如下：

|名称        | 类型 |说明|
|-----------|---- | --- |
|cooldown|   Integer | 下次进行 license check 前至少等待的时间长度，该字段表示一个时间长度，单位：秒 |
|nextcheck  |Integer| 下次校验 license 时间，该字段为一个时间戳 |
|not_before |Integer| license 开始生效时间，该字段为一个时间戳 |
|not_after   |Integer| license 过期时间，该字段为一个时间戳 |
|plan_type   |String|付费的 plan 类型|


### sdk.getPlanType()

#### 参数

无

#### 返回值
`Promise.<'EVALUATION'|'FREE'|'FREEMIUM'|'COMMERCIAL'>`

planType 说明如下：

|名称       |说明 | 是否为付费 plan |
|-----------|----| :---: |
|EVALUATION|评估版| N |
|FREE      |免费版| N |
|FREEMIUM | 免费+附加费版 | Y |
|COMMERCIAL|商业版| Y |


### sdk.isPaidPlan()
用户使用的是否为付费的 plan

#### 参数

无

#### 返回值
`Promise.<true|false>`

### sdk.request()

#### X-MiniApp-Plugin-Signature
sdk.request() 请求的 header 会包含 `X-MiniApp-Plugin-Signature` 字段，开发
者在自己的服务器上可以使用此字段对请求进行鉴权，X-MiniApp-Plugin-Signature 的计算方式如下：

```
ENCODED_LICENSE = BASE64(json_encode(license))

X-MiniApp-Plugin-Signature: {'appid': $APPID, 'license': ENCODED_LICENSE, 'nonce': $EIGHT_BYTE_RANDOM_STRING, 'signature': SHA256( sprintf("%s%s%s%s", APPID, ENCODED_LICENSE, APP_SECRET, EIGHT_BYTE_RANDOM_STRING) )}
```


#### 参数

| 名称 | 类型 | 说明 |
|------|-----|------|
|forceSend|Boolean | 当 license 已过期时，是否继续发送请求，默认为 `false` |

其他参数和微信官方文档上的 [wx.request() API](https://developers.weixin.qq.com/miniprogram/dev/api/network-request.html) 保持一致。

#### 返回值
`Promise.<any>`

#### forceSend 示例
```js
sdk.isValid()   // ===> false
sdk.request({ url: 'https://xiaoapp.io', forceSend: true }).then(res => { console.log(res) }) // request send success
// ==============
sdk.request({ url: 'https://xiaoapp.io' }).catch(err => { console.log(err.message) }) // throw error 'license 已过期'
```
