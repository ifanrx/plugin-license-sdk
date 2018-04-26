import _request from './request'
import Licence from './License'
import {defer} from 'rsvp'
import config from './config'

class PluginSDK {
  constructor() {
    this._licence = new Licence()
    this.deferred = defer()
  }

  init(args) {
    let argsList = ['appId', 'pluginId', 'version', 'secretKey']

    for (let i = 0; i < argsList.length; i++) {
      let v = args[argsList[i]]
      if (!v) {
        throw new Error(`need param ${argsList[i]}`)
      }

      config.set(argsList[i], v)
    }

    // check cooldown

    // check expired

    this.deferred.resolve()
  }

  isValid() {
    return this.deferred.promise.then(() => {
      return this._licence.isValid
    })
  }

  request() {
    return _request.apply(this, arguments)
  }

  updateLicense() {

  }

  getPlanType() {

  }

  isPaidPlan() {

  }

  haveCapability() {

  }

  getUserData() {

  }
}

module.exports = new PluginSDK()
