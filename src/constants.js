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
  SIGNATURE_KEY: 'X-MiniApp-Plugin-Signature',
  STORAGE_PREFIX_KEY: 'ifx_plugin_license_',
  LICENCE_STORAGE_KEY: 'licence',
  LAST_FETCH_TIME: 'last_fetch',
  API_HOST: '',
  PLAN_TYPE: {
    EVALUATION: 'EVALUATION', FREE: 'FREE', FREEMIUM: 'FREEMIUM', COMMERCIAL: 'COMMERCIAL'
  }
}
