const request = require('supertest');

const {
    licenceServiceStub,
    loggerStub,
    createPrisonerServiceStub,
    authenticationMiddleware,
    appSetup
} = require('../supertestSetup');

const createRoute = require('../../server/routes/sent');

const prisonerService = createPrisonerServiceStub();
prisonerService.getOrganisationContactDetails = sinon.stub().resolves({premise: 'HMP Blah', com: {name: 'Something'}});

const app = appSetup(createRoute({
    licenceService: licenceServiceStub,
    prisonerService,
    logger: loggerStub,
    authenticationMiddleware
}));

describe('GET sent', () => {

    beforeEach(() => {
        prisonerService.getOrganisationContactDetails.reset();
    });

    it('renders the sent page for CAtoRO', () => {
        return request(app)
            .get('/RO/caToRo/123')
            .expect(200)
            .expect(() => {
                expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce();
                expect(prisonerService.getOrganisationContactDetails).to.be.calledWith('RO', '123', 'token');
            })
            .expect(res => {
                expect(res.text).to.include('Case sent');
            });
    });

    it('renders the sent page for CAtoDM', () => {
        return request(app)
            .get('/DM/caToDm/123')
            .expect(200)
            .expect(() => {
                expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce();
                expect(prisonerService.getOrganisationContactDetails).to.be.calledWith('DM', '123', 'token');
            })
            .expect(res => {
                expect(res.text).to.include('Submitted for approval');
            });
    });

    it('renders the sent page for ROtoCA', () => {
        return request(app)
            .get('/CA/roToCa/123')
            .expect(200)
            .expect(() => {
                expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce();
                expect(prisonerService.getOrganisationContactDetails).to.be.calledWith('CA', '123', 'token');
            })
            .expect(res => {
                expect(res.text).to.include('Case sent');
            });
    });

    it('renders the sent page for DMtoCA', () => {
        return request(app)
            .get('/CA/dmToCa/123')
            .expect(200)
            .expect(() => {
                expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce();
                expect(prisonerService.getOrganisationContactDetails).to.be.calledWith('CA', '123', 'token');
            })
            .expect(res => {
                expect(res.text).to.include('Submitted to prison case admin');
            });
    });

    it('renders the sent page for CAtoDMRefusal', () => {
        return request(app)
            .get('/DM/caToDmRefusal/123')
            .expect(200)
            .expect(() => {
                expect(prisonerService.getOrganisationContactDetails).to.be.calledOnce();
                expect(prisonerService.getOrganisationContactDetails).to.be.calledWith('DM', '123', 'token');
            })
            .expect(res => {
                expect(res.text).to.include('Submitted for refusal');
            });
    });

    it('errors when an invalid transition type is provided', () => {
        return request(app)
            .get('/CA/foobar/123')
            .expect(500);
    });
});

