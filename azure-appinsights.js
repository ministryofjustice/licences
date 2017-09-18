if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    const appInsights = require('applicationinsights');
    appInsights.setup()
        .setAutoCollectExceptions(false) // logger handles these
        .start();
    module.exports = appInsights;
} else {
    module.exports = null;
}
