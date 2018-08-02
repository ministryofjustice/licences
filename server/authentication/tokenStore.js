const logger = require('../../log');

const {mergeWithRight, getIn} = require('../utils/functionalHelpers');

function TokenStore() {
    this.tokens = {};
}

TokenStore.prototype.store = function(username, role, token, refreshToken) {

    logger.debug(`Storing token for: ${username}, token: ${token}`);

    if (!(username && role && token)) {
        throw new Error('Invalid token store entry');
    }

    const timestamp = new Date();
    this.tokens = mergeWithRight(this.tokens, {[username]: {role, token, refreshToken, timestamp}});

    return timestamp;
};

TokenStore.prototype.get = function(username) {

    const tokens = getIn(this.tokens, [username]);
    logger.debug(`Returning token for: ${username}`);
    logger.debug(tokens);

    return tokens;
};

module.exports = TokenStore;
