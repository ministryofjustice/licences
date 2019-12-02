const { serviceCheckFactory } = require('../data/healthcheck')

const service = (name, url) => {
  const check = serviceCheckFactory(name, url)
  return () =>
    check()
      .then(result => ({ name, status: 'UP', message: result }))
      .catch(err => ({ name, status: 'ERROR', message: err }))
}

const gatherCheckInfo = (total, currentValue) => Object.assign({}, total, { [currentValue.name]: currentValue.message })

const getBuild = () => {
  try {
    // @ts-ignore
    // eslint-disable-next-line import/no-unresolved,global-require
    return require('../../build-info.json')
  } catch (ex) {
    return null
  }
}

const addAppInfo = result => {
  const buildInformation = getBuild()
  const buildInfo = {
    uptime: process.uptime(),
    build: buildInformation,
    version: (buildInformation && buildInformation.buildNumber) || 'Not available',
  }

  return Object.assign({}, result, buildInfo)
}

module.exports = function healthcheckFactory(elite2Url, authUrl, deliusUrl) {
  const checks = [
    service('elite2', `${elite2Url}/ping`),
    service('auth', `${authUrl}/ping`),
    service('delius', `${deliusUrl}/ping`),
  ]

  return callback =>
    Promise.all(checks.map(fn => fn())).then(checkResults => {
      const allOk = checkResults.every(item => item.status === 'UP') ? 'UP' : 'DOWN'
      const result = {
        name: 'Licences',
        status: allOk,
        api: checkResults.reduce(gatherCheckInfo, {}),
      }
      callback(null, addAppInfo(result))
    })
}
