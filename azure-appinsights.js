require('dotenv').config();

if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    const appInsights = require('applicationinsights');
    appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
        .setAutoCollectExceptions(false) // logger handles these
        .start();
    module.exports = appInsights;
} else {
    module.exports = null;
}
