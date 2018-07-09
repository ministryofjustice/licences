if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    const appInsights = require('applicationinsights');
    appInsights.setup()
        .start();
    module.exports = appInsights;
} else {
    module.exports = null;
}
