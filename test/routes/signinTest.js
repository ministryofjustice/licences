const {
    request,
    sandbox,
    expect
} = require('../supertestSetup');

const {urlencoded} = require('body-parser');
const express = require('express');

const createSignInEndpoint = require('../../server/routes/signIn');
const mockAuthentication = require('../mockAuthentication');

describe('POST /login', () => {
    const app = express();
    const fakeSignInService = sandbox.stub();

    mockAuthentication.setupMockAuthentication(app, fakeSignInService);
    app.use(urlencoded({extended: true}));
    app.use(createSignInEndpoint());

    context('Successful sign in', () => {
        it('redirects to "/" path', () => {
            fakeSignInService.signIn = sandbox.stub().returnsPromise().resolves({
                firstName: 'staff',
                lastName: 'user',
                token: 'aToken'
            });

            return request(app)
                .post('/')
                .send('username=auser&password=apass')
                .expect(302)
                .expect(res => {
                    expect(res.headers.location).to.eql('/');
                });
        });
    });

    context('Unsuccessful sign in', () => {
        it('redirects back to the "/login" path when the sign in fails', () => {
            const error = new Error('Foo error');
            error.type = 'foo-error';

            fakeSignInService.signIn = sandbox.stub().returnsPromise().rejects(error);

            return request(app)
                .post('/')
                .send('username=auser&password=apass')
                .expect(302)
                .expect(res => {
                    expect(res.headers.location).to.eql('/login');
                });
        });
    });
});
