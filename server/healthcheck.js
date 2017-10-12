const {
    dbCheck,
    nomisApiCheck
} = require('./data/healthcheck');

function db() {
    return dbCheck()
        .then(() => ({name: 'db', status: 'ok', message: 'OK'}))
        .catch(err => ({name: 'db', status: 'ERROR', message: err.message}));
}

function nomisApi() {
    return nomisApiCheck()
        .then(result => ({name: 'nomis', status: 'ok', message: result}))
        .catch(err => ({name: 'nomis', status: 'ERROR', message: err}));
}

module.exports = function healthcheck(callback) {
    const checks = [db, nomisApi];

    return Promise
        .all(checks.map(fn => fn()))
        .then(checkResults => {
            const allOk = checkResults.every(item => item.status === 'ok');
            const result = {
                healthy: allOk,
                checks: checkResults.reduce(gatherCheckInfo, {})
            };
            callback(null, addAppInfo(result));
        });
};

function gatherCheckInfo(total, currentValue) {
    return Object.assign({}, total, {[currentValue.name]: currentValue.message});
}

function addAppInfo(result) {
    const buildInfo = {
        uptime: process.uptime(),
        build: getBuild(),
        version: getVersion()
    };

    return Object.assign({}, result, buildInfo);
}

function getVersion() {
    try {
        return require('../package.json').version;
    } catch (ex) {
        return null;
    }
}

function getBuild() {
    try {
        return require('../build-info.json');
    } catch (ex) {
        return null;
    }
}

