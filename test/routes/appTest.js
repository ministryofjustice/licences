const request = require('supertest');
const {appSetup} = require('../supertestSetup');


describe('GET /', () => {

    const defaultRoute = require('../../server/routes/default');

    it('redirects to caselist for normal users', () => {

        const app = appSetup(defaultRoute(), 'caUser');

        return request(app)
            .get('/')
            .expect(302)
            .expect('Location', '/caseList/');
    });

    it('redirects to admin for admin users', () => {

        const app = appSetup(defaultRoute(), 'batchUser');

        return request(app)
            .get('/')
            .expect(302)
            .expect('Location', '/admin/');
    });
});


