const appInsights = require('applicationinsights')
require('dotenv').config()

if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    appInsights
        .setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
        .setAutoCollectExceptions(false) // logger handles these
        .start()
    module.exports = appInsights
} else {
    module.exports = null
}
