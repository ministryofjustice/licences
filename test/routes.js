
const request = require('supertest');
const app = require('../server/app');

describe('routes', () => {

    describe('dashboard route', () => {

        it('should return 200 and html', done => {
            request(app).get('/dashboard')
                .expect(200)
                .expect('Content-Type', /text\/html/)
                .end(done);
        });
    });
});
