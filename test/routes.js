
const request = require('supertest');
const app = require('../server/app');

const nock = require('nock');


beforeEach(() => {
    nock('http://localhost:9090')
        .get('/api/v2/releases')
        .query({nomisId: ['A1235HG', 'A6627JH']})
        .reply(200, []);
});

describe('routes', () => {

    describe('dashboard route', () => {

        it('should return 200 and html', done => {
            request(app).get('/dashboard')
                .expect(200)
                .expect('Content-Type', /text\/html/)
                .end(done);
        });
    });

    describe('details route', () => {

        it('should return 200 and html', done => {
            request(app).get('/details/1')
                .expect(200)
                .expect('Content-Type', /text\/html/)
                .end(done);
        });
    });

    describe('discharge address route', () => {

        it('should return 200 and html', done => {
            request(app).get('/dischargeAddress/1')
                .expect(200)
                .expect('Content-Type', /text\/html/)
                .end(done);
        });
    });

    describe('additional conditions route', () => {

        it('should return 200 and html', done => {
            request(app).get('/additionalConditions/1')
                .expect(200)
                .expect('Content-Type', /text\/html/)
                .end(done);
        });
    });
});
