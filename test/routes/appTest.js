const request = require('supertest')
const defaultRoute = require('../../server/routes/default')
const { appSetup } = require('../supertestSetup')

describe('GET /', () => {
    it('redirects to caselist for normal users', () => {
        const app = appSetup(defaultRoute(), 'caUser')

        return request(app)
            .get('/')
            .expect(302)
            .expect('Location', '/caseList/active')
    })

    it('redirects to admin for admin users', () => {
        const app = appSetup(defaultRoute(), 'batchUser')

        return request(app)
            .get('/')
            .expect(302)
            .expect('Location', '/admin/')
    })
})
