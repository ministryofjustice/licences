const Store = require('../../server/authentication/tokenStore');

const {
    expect,
    sinon
} = require('../testSetup');

let clock;

const tokenStore = new Store();

describe('tokenStore', () => {

    beforeEach(() => {
        clock = sinon.useFakeTimers(new Date('May 31, 2018 12:00:00').getTime());
    });

    afterEach(() => {
        clock.restore();
    });

    describe('addOrUpdate', () => {

        it('should add a new field to the store', () => {
            tokenStore.addOrUpdate('username', 'token', 'refresh');
            expect(tokenStore.getTokens('username')).to.eql({
                token: 'token',
                refreshToken: 'refresh',
                timestamp: new Date('May 31, 2018 12:00:00')
            });
        });

        it('should update an existing field to the store', () => {
            tokenStore.addOrUpdate('username', 'token2', 'refresh2');
            expect(tokenStore.getTokens('username')).to.eql({
                token: 'token2',
                refreshToken: 'refresh2',
                timestamp: new Date('May 31, 2018 12:00:00')
            });
        });
    });
});
