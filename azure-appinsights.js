const appInsights = require('applicationinsights')
const fs = require('fs')
require('dotenv').config()

const packageData = JSON.parse(fs.readFileSync('./package.json').toString())

const buildNumber = fs.existsSync('./build-info.json')
  ? JSON.parse(fs.readFileSync('./build-info.json').toString()).buildNumber
  : packageData.version

if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  appInsights
    .setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .start()
  appInsights.defaultClient.context.tags['ai.cloud.role'] = `${packageData.name}`
  appInsights.defaultClient.context.tags['ai.application.ver'] = buildNumber
  module.exports = appInsights
} else {
  module.exports = null
}
