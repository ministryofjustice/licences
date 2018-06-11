const {mergeWithRight, getIn} = require('../utils/functionalHelpers');

function TokenStore() {
    this.tokens = {};
}

TokenStore.prototype.store = (username, role, token, refreshToken) => {

    if(!(username && role && token)) {
        throw new Error('Invalid token store entry');
    }

    const timestamp = new Date();
    this.tokens = mergeWithRight(this.tokens, {[username]: {role, token, refreshToken, timestamp}});
};

TokenStore.prototype.get = username => {
    return getIn(this.tokens, [username]);
};

module.exports = TokenStore;
