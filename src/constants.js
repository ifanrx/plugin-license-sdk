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
  SIGNATURE_KEY: 'X-MiniApp-Plugin-Signature',
  STORAGE_PREFIX_KEY: 'ifx_plugin_license_',
  LICENCE_STORAGE_KEY: 'ifx_licence_',
  LAST_FETCH_TIME: 'ifx_last_fetch_',
  API_HOST: '',
}
