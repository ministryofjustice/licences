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

    describe('store', () => {

        it('should add a new field to the store', () => {
            tokenStore.store('username', 'role', 'token', 'refresh');
            expect(tokenStore.get('username')).to.eql({
                role: 'role',
                token: 'token',
                refreshToken: 'refresh',
                timestamp: new Date('May 31, 2018 12:00:00')
            });
        });

        it('should update an existing field to the store', () => {
            tokenStore.store('username', 'role', 'token2', 'refresh2');
            expect(tokenStore.get('username')).to.eql({
                role: 'role',
                token: 'token2',
                refreshToken: 'refresh2',
                timestamp: new Date('May 31, 2018 12:00:00')
            });
        });

        it('should reject when missing username', () => {
            expect(() => tokenStore.store('', 'role', 'token', 'refresh').to.throw);
        });

        it('should reject when missing role', () => {
            expect(() => tokenStore.store('user', '', 'token', 'refresh').to.throw);
        });

        it('should reject when missing token', () => {
            expect(() => tokenStore.store('user', 'role', '', 'refresh').to.throw);
        });

        it('should add a new field to the store when missing refresh token', () => {
            tokenStore.store('username', 'role', 'token', '');
            expect(tokenStore.get('username')).to.eql({
                role: 'role',
                token: 'token',
                refreshToken: '',
                timestamp: new Date('May 31, 2018 12:00:00')
            });
        });
    });
});
