const logger = require('../../log');

const {mergeWithRight, getIn} = require('../utils/functionalHelpers');

function TokenStore() {
    this.tokens = {};
}

TokenStore.prototype.store = function(username, role, token, refreshToken) {

    logger.info(`Storing token for: ${username}, token: ${token}`);

    if (!(username && role && token)) {
        throw new Error('Invalid token store entry');
    }

    const timestamp = new Date();
    this.tokens = mergeWithRight(this.tokens, {[username]: {role, token, refreshToken, timestamp}});

    return timestamp;
};

TokenStore.prototype.get = function(username) {

    const tokens = getIn(this.tokens, [username]);
    logger.info(`Returning token for: ${username}, token: ${tokens.token}`);

    return tokens;
};

module.exports = TokenStore;
