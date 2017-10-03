const request = require('supertest');
const sinon = require('sinon');
const express = require('express');
const path = require('path');
const sinonChai = require('sinon-chai');
const chai = require('chai');
const expect = chai.expect;
chai.use(sinonChai);
const createReportingInstructionRoute = require('../../server/routes/reportingInstructions');

const app = express();

const getInputsStub = sinon.stub().returns({foo: 'bar'});

const stub = {
    getExistingInputs: getInputsStub
};

app.use(createReportingInstructionRoute({reportingInstructionService: stub}));
app.set('views', path.join(__dirname, '../../server/views'));
app.set('view engine', 'pug');

describe('GET /reporting/:prisonNumber', () => {
    it('getExistingInputs from reportingInstructionsService', () => {
        return request(app)
            .get('/1')
            .expect(200)
            .expect('Content-Type', /html/)
            .expect(res => {
                expect(getInputsStub.callCount).to.equal(1);
            });

    });
});

