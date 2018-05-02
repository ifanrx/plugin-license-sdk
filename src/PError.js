class PError {
  constructor(code, msg) {
    let error = new Error()

    error.code = code
    error.message = msg ? `${code}: ${msg}` : `${code}: ${this.mapErrorMessage(code)}`

    return error
  }

  // 前端错误信息定义
  mapErrorMessage(code) {
    switch (code) {
    case 600:
      return 'network disconnected'
    case 601:
      return 'request timeout'
    default:
      return 'unknown error'
    }
  }
}

export default PError
