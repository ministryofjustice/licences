const {mergeWithRight, getIn} = require('../utils/functionalHelpers');

function TokenStore() {
    this.tokens = {};
}

TokenStore.prototype.store = (userId, role, token, refreshToken) => {
    const timestamp = new Date();
    this.tokens = mergeWithRight(this.tokens, {[userId]: {role, token, refreshToken, timestamp}});
};

TokenStore.prototype.get = userId => {
    return getIn(this.tokens, [userId]);
};

module.exports = TokenStore;
