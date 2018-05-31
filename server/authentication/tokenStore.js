const {mergeWithRight, getIn} = require('../utils/functionalHelpers');

function TokenStore() {
    this.tokens = {};
}

TokenStore.prototype.addOrUpdate = (userId, token, refreshToken) => {
    this.tokens = mergeWithRight(this.tokens, {[userId]: {token, refreshToken}});
};

TokenStore.prototype.getTokens = userId => {
    return getIn(this.tokens, [userId]);
};

module.exports = TokenStore;
