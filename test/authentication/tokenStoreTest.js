const Store = require('../../server/authentication/tokenStore');

const {
    expect
} = require('../testSetup');

const tokenStore = new Store();

describe('tokenStore', () => {
    describe('addOrUpdate', () => {

        it('should add a new field to the store', () => {
            tokenStore.addOrUpdate('username', 'token', 'refresh');
            expect(tokenStore.getTokens('username')).to.eql({token: 'token', refreshToken: 'refresh'});
        });

        it('should update an existing field to the store', () => {
            tokenStore.addOrUpdate('username', 'token2', 'refresh2');
            expect(tokenStore.getTokens('username')).to.eql({token: 'token2', refreshToken: 'refresh2'});
        });
    });
});
