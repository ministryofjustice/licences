const request = require('supertest');
const {urlencoded} = require('body-parser');
const express = require('express');
const flash = require('connect-flash');

const createRoute = require('../../server/routes/signIn');
const mockAuthentication = require('../mockAuthentication');

describe('POST /login', () => {
    context('Successful sign in', () => {
        it('redirects to "/" path', () => {
            const fakeSignInService = {
                signIn: sinon.stub().resolves({
                    firstName: 'staff',
                    lastName: 'user',
                    token: 'aToken'
                })
            };

            const app = createSignInApp(fakeSignInService);

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

            const fakeSignInService = {
                signIn: sinon.stub().rejects(error)
            };

            const app = createSignInApp(fakeSignInService);

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

function createSignInApp(fakeSignInService) {
    const app = express();

    mockAuthentication.setupMockAuthentication(app, fakeSignInService);
    app.use(urlencoded({extended: true}));
    app.use(flash());
    app.use(createRoute());

    return app;
}
