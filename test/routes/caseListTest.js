const request = require('supertest');

const {
    appSetup,
    caseListServiceStub,
    loggerStub,
    authenticationMiddleware,
    auditStub
} = require('../supertestSetup');

const {roles} = require('../../server/models/roles');

const caseListResponse = require('./stubs/caseListResponse');

const createCaseListRoute = require('../../server/routes/caseList');

describe('GET /caseList', () => {

    beforeEach(() => {
        caseListServiceStub.getHdcCaseList.resolves(caseListResponse);
    });

    const app = appSetup(createCaseListRoute({
        logger: loggerStub,
        caseListService: caseListServiceStub,
        authenticationMiddleware,
        audit: auditStub
    }));

    it('redirects to tab if none supplied', () => {
        return request(app)
            .get('/')
            .expect(302)
            .expect(res => {
                expect(res.header.location).to.include('/caseList/ready');
            });
    });

    it('redirects to tab if unexpected tab supplied', () => {
        return request(app)
            .get('/fefe')
            .expect(302)
            .expect(res => {
                expect(res.header.location).to.include('/caseList/ready');
            });
    });


    it('renders and HTML output', () => {
        return request(app)
            .get('/ready')
            .expect(200)
            .expect('Content-Type', /html/);
    });

    it('renders the hdc eligible prisoners page', () => {
        return request(app)
            .get('/ready')
            .expect(200)
            .expect(res => {
                expect(res.text).to.include('id="hdcEligiblePrisoners">');
            });
    });

    context('user is CA', () => {

        context('tab is ready', () => {
            it('should filter out offenders at a stage that isnt UNSTARTED or ELIGIBILTY', () => {
                return request(app)
                    .get('/ready')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('RO Processing Andrews');
                        expect(res.text).to.include('Unstarted Andrews');
                        expect(res.text).to.include('Eligibility Andrews');
                        expect(res.text).to.not.include('Approval Andrews');
                        expect(res.text).to.not.include('Approved Andrews');
                        expect(res.text).to.not.include('Refused Andrews');
                        expect(res.text).to.not.include('Processing CA not postponed Andrews');
                        expect(res.text).to.not.include('Processing CA postponed Andrews');
                        expect(res.text).to.not.include('Opted out Andrews');
                        expect(res.text).to.not.include('Eligible Andrews');
                    });
            });
        });
        context('tab is getAddress', () => {
            it('should filter out offenders unless stage ELIGIBILTY and status Eligible (or address related)', () => {
                return request(app)
                    .get('/getAddress')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('RO Processing Andrews');
                        expect(res.text).to.not.include('Unstarted Andrews');
                        expect(res.text).to.not.include('Eligibility Andrews');
                        expect(res.text).to.not.include('Approval Andrews');
                        expect(res.text).to.not.include('Approved Andrews');
                        expect(res.text).to.not.include('Refused Andrews');
                        expect(res.text).to.not.include('Processing CA not postponed Andrews');
                        expect(res.text).to.not.include('Processing CA postponed Andrews');
                        expect(res.text).to.include('Opted out Andrews');
                        expect(res.text).to.include('Eligible Andrews');
                        expect(res.text).to.include('GettingAddress Andrews');
                        expect(res.text).to.include('AddressRejected Andrews');
                    });
            });
        });
        context('tab is submittedRo', () => {
            it('should filter out offenders at a stage that isnt PROCESSING_RO', () => {
                return request(app)
                    .get('/submittedRo')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.include('RO Processing Andrews');
                        expect(res.text).to.not.include('Unstarted Andrews');
                        expect(res.text).to.not.include('Eligibility Andrews');
                        expect(res.text).to.not.include('Approval Andrews');
                        expect(res.text).to.not.include('Approved Andrews');
                        expect(res.text).to.not.include('Refused Andrews');
                        expect(res.text).to.not.include('Processing CA not postponed Andrews');
                        expect(res.text).to.not.include('Processing CA postponed Andrews');
                        expect(res.text).to.not.include('Opted out Andrews');
                        expect(res.text).to.not.include('Eligible Andrews');
                    });
            });
        });
        context('tab is submittedRo', () => {
            it('should filter out offenders at a stage that isnt PROCESSING_CA', () => {
                return request(app)
                    .get('/reviewCase')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('RO Processing Andrews');
                        expect(res.text).to.not.include('Unstarted Andrews');
                        expect(res.text).to.not.include('Eligibility Andrews');
                        expect(res.text).to.not.include('Approval Andrews');
                        expect(res.text).to.not.include('Approved Andrews');
                        expect(res.text).to.not.include('Refused Andrews');
                        expect(res.text).to.include('Processing CA not postponed Andrews');
                        expect(res.text).to.include('Processing CA postponed Andrews');
                        expect(res.text).to.not.include('Opted out Andrews');
                        expect(res.text).to.not.include('Eligible Andrews');
                    });
            });
        });
        context('tab is submittedDm', () => {
            it('should filter out offenders at a stage that isnt APPROVAL', () => {
                return request(app)
                    .get('/submittedDm')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('RO Processing Andrews');
                        expect(res.text).to.not.include('Unstarted Andrews');
                        expect(res.text).to.not.include('Eligibility Andrews');
                        expect(res.text).to.include('Approval Andrews');
                        expect(res.text).to.not.include('Approved Andrews');
                        expect(res.text).to.not.include('Refused Andrews');
                        expect(res.text).to.not.include('Processing CA not postponed Andrews');
                        expect(res.text).to.not.include('Processing CA postponed Andrews');
                        expect(res.text).to.not.include('Opted out Andrews');
                        expect(res.text).to.not.include('Eligible Andrews');
                    });
            });
        });
        context('tab is decided', () => {
            it('should filter out offenders at a stage that isnt DECIDED with status Approved', () => {
                return request(app)
                    .get('/create')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('RO Processing Andrews');
                        expect(res.text).to.not.include('Unstarted Andrews');
                        expect(res.text).to.not.include('Eligibility Andrews');
                        expect(res.text).to.not.include('Approval Andrews');
                        expect(res.text).to.include('Approved Andrews');
                        expect(res.text).to.not.include('Refused Andrews');
                        expect(res.text).to.not.include('Processing CA not postponed Andrews');
                        expect(res.text).to.not.include('Processing CA postponed Andrews');
                        expect(res.text).to.not.include('Opted out Andrews');
                        expect(res.text).to.not.include('Eligible Andrews');
                    });
            });
        });

    });

    context('user is RO', () => {

        const testUser = {
            firstName: 'first',
            lastName: 'last',
            staffId: 'id',
            token: 'token',
            role: roles.RO
        };

        const app = appSetup(createCaseListRoute({
            logger: loggerStub,
            caseListService: caseListServiceStub,
            authenticationMiddleware,
            audit: auditStub
        }), testUser);

        beforeEach(() => {
            caseListServiceStub.getHdcCaseList.resolves(caseListResponse);
        });

        context('tab is ready', () => {
            it('should filter out offenders at a stage that isnt PROCESSING_RO with status Ready to check', () => {
                return request(app)
                    .get('/ready')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('RO Processing Andrews');
                        expect(res.text).to.not.include('Unstarted Andrews');
                        expect(res.text).to.not.include('Eligibility Andrews');
                        expect(res.text).to.not.include('Approval Andrews');
                        expect(res.text).to.not.include('Approved Andrews');
                        expect(res.text).to.not.include('Refused Andrews');
                        expect(res.text).to.include('ReadyToCheck Andrews');
                    });
            });
        });
        context('tab is withPrison', () => {
            it('should filter out offenders at a stage that isnt PROCESSING_CA or APPROVAL', () => {
                return request(app)
                    .get('/withPrison')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('RO Processing Andrews');
                        expect(res.text).to.not.include('Unstarted Andrews');
                        expect(res.text).to.not.include('Eligibility Andrews');
                        expect(res.text).to.include('Approval Andrews');
                        expect(res.text).to.not.include('Approved Andrews');
                        expect(res.text).to.not.include('Refused Andrews');
                        expect(res.text).to.include('Processing CA not postponed Andrews');
                        expect(res.text).to.include('Processing CA postponed Andrews');
                    });
            });
        });
        context('tab is approved', () => {
            it('should filter out offenders at a stage that isnt DECIDED with status Approved', () => {
                return request(app)
                    .get('/approved')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('RO Processing Andrews');
                        expect(res.text).to.not.include('Unstarted Andrews');
                        expect(res.text).to.not.include('Eligibility Andrews');
                        expect(res.text).to.not.include('Approval Andrews');
                        expect(res.text).to.include('Approved Andrews');
                        expect(res.text).to.not.include('Refused Andrews');
                        expect(res.text).to.not.include('Processing CA not postponed Andrews');
                        expect(res.text).to.not.include('Processing CA postponed Andrews');
                    });
            });
        });
    });

    context('user is DM', () => {

        const testUser = {
            firstName: 'first',
            lastName: 'last',
            staffId: 'id',
            token: 'token',
            role: roles.DM
        };

        const app = appSetup(createCaseListRoute({
            logger: loggerStub,
            caseListService: caseListServiceStub,
            authenticationMiddleware,
            audit: auditStub
        }), testUser);

        context('tab is ready', () => {
            it('should filter out offenders at a stage that isnt APPROVAL', () => {
                return request(app)
                    .get('/ready')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('RO Processing Andrews');
                        expect(res.text).to.not.include('Unstarted Andrews');
                        expect(res.text).to.not.include('Eligibility Andrews');
                        expect(res.text).to.include('Approval Andrews');
                        expect(res.text).to.not.include('Approved Andrews');
                        expect(res.text).to.not.include('Refused Andrews');
                        expect(res.text).to.not.include('Processing CA not postponed Andrews');
                        expect(res.text).to.not.include('Processing CA postponed Andrews');
                    });
            });
        });
        context('tab is approved', () => {
            it('should filter out offenders at a stage that isnt DECIDED with status Approved', () => {
                return request(app)
                    .get('/approved')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('RO Processing Andrews');
                        expect(res.text).to.not.include('Unstarted Andrews');
                        expect(res.text).to.not.include('Eligibility Andrews');
                        expect(res.text).to.not.include('Approval Andrews');
                        expect(res.text).to.include('Approved Andrews');
                        expect(res.text).to.not.include('Refused Andrews');
                        expect(res.text).to.not.include('Processing CA not postponed Andrews');
                        expect(res.text).to.not.include('Processing CA postponed Andrews');
                    });
            });
        });
        context('tab is refused', () => {
            it('should filter out offenders at a stage that isnt DECIDED with status Refused', () => {
                return request(app)
                    .get('/refused')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('RO Processing Andrews');
                        expect(res.text).to.not.include('Unstarted Andrews');
                        expect(res.text).to.not.include('Eligibility Andrews');
                        expect(res.text).to.not.include('Approval Andrews');
                        expect(res.text).to.not.include('Approved Andrews');
                        expect(res.text).to.include('Refused Andrews');
                        expect(res.text).to.not.include('Processing CA not postponed Andrews');
                        expect(res.text).to.not.include('Processing CA postponed Andrews');
                    });
            });
        });
        context('tab is postponed', () => {
            it('should filter out offenders without status Postponed', () => {
                return request(app)
                    .get('/postponed')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('RO Processing Andrews');
                        expect(res.text).to.not.include('Unstarted Andrews');
                        expect(res.text).to.not.include('Eligibility Andrews');
                        expect(res.text).to.not.include('Approval Andrews');
                        expect(res.text).to.not.include('Approved Andrews');
                        expect(res.text).to.not.include('Refused Andrews');
                        expect(res.text).to.not.include('Processing CA not postponed Andrews');
                        expect(res.text).to.include('Processing CA postponed Andrews');
                    });
            });
        });
    });
});
