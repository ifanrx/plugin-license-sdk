module.exports = {
  STATUS_CODE: {
    CREATED: 201,
    SUCCESS: 200,
    UPDATE: 200,
    PATCH: 200,
    DELETE: 204,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
  },
  httpMethodCodeMap: {
    GET: 200,
    POST: 201,
    PUT: 200,
    PATCH: 200,
    DELETE: 204,
  },
  PARDON_TIME_KEY: 'pardon',
  PARDON_TIME: 1800, // 使用中过期，宽限时间
  SIGNATURE_KEY: 'X-MiniApp-Plugin-Signature',
  STORAGE_PREFIX_KEY: 'ifx_plugin_license_',
  LICENSE_STORAGE_KEY: 'license',
  LAST_FETCH_TIME: 'last_fetch',
  API_HOST: 'https://api.xiaoapp.io',
  PLAN_TYPE: {
    EVALUATION: 'EVALUATION', FREE: 'FREE', FREEMIUM: 'FREEMIUM', COMMERCIAL: 'COMMERCIAL'
  }
}
