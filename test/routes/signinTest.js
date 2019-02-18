const request = require('supertest')
const { urlencoded } = require('body-parser')
const express = require('express')
const flash = require('connect-flash')

const createRoute = require('../../server/routes/signIn')
const mockAuthentication = require('../mockAuthentication')

describe('POST /login', () => {
    const fakeSignInService = {
        signIn: sinon.stub().resolves({
            firstName: 'staff',
            lastName: 'user',
            token: 'aToken',
        }),
        getClientCredentialsTokens: sinon.stub().resolves({ token: 'cdt' }),
    }

    const fakeUserService = {
        getUserProfile: sinon.stub().resolves({ name: 'someone', role: 'CA', staffId: 'sid' }),
    }

    const fakeAudit = { record: sinon.stub() }
    context('Successful sign in', () => {
        it('redirects to "/" path', () => {
            const app = createSignInApp(fakeSignInService, fakeUserService, fakeAudit)

            return request(app)
                .post('/')
                .send('username=auser&password=apass')
                .expect(302)
                .expect('Location', '/caseList/active')
        })

        it('redirects to target if on same domain', () => {
            const app = createSignInApp(fakeSignInService, fakeUserService, fakeAudit)

            return request(app)
                .post('/?target=/some/page')
                .send('username=auser&password=apass')
                .expect(302)
                .expect('Location', 'http://localhost:3000/some/page')
        })

        it('redirects to / if target from different domain', () => {
            const app = createSignInApp(fakeSignInService, fakeUserService, fakeAudit)

            return request(app)
                .post('/?target=http://evil.com')
                .send('username=auser&password=apass')
                .expect(302)
                .expect('Location', '/caseList/active')
        })
    })

    context('Unsuccessful sign in', () => {
        it('redirects back to the "/login" path when the sign in fails', () => {
            const error = new Error('Foo error')
            error.type = 'foo-error'

            fakeSignInService.signIn = sinon.stub().rejects(error)

            const app = createSignInApp(fakeSignInService, fakeUserService, fakeAudit)

            return request(app)
                .post('/')
                .send('username=auser&password=apass')
                .expect(302)
                .expect(res => {
                    expect(res.headers.location).to.eql('/login')
                })
        })
    })
})

function createSignInApp(fakeSignInService, fakeUserService, fakeAudit) {
    const app = express()

    mockAuthentication.setupMockAuthentication(app, fakeSignInService, fakeUserService, fakeAudit)
    app.use(urlencoded({ extended: true }))
    app.use(flash())
    app.use(createRoute())

    return app
}
