const {
    request,
    appSetup,
    expect,
    caseListServiceStub,
    loggerStub,
    authenticationMiddleware
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
        authenticationMiddleware
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
                        expect(res.text).to.not.include('Andrews, RO Processing');
                        expect(res.text).to.include('Andrews, Unstarted');
                        expect(res.text).to.include('Andrews, Eligibility');
                        expect(res.text).to.not.include('Andrews, Approval');
                        expect(res.text).to.not.include('Andrews, Approved');
                        expect(res.text).to.not.include('Andrews, Refused');
                        expect(res.text).to.not.include('Andrews, Processing CA not postponed');
                        expect(res.text).to.not.include('Andrews, Processing CA postponed');
                    });
            });
        });
        context('tab is submittedRo', () => {
            it('should filter out offenders at a stage that isnt PROCESSING_RO', () => {
                return request(app)
                    .get('/submittedRo')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.include('Andrews, RO Processing');
                        expect(res.text).to.not.include('Andrews, Unstarted');
                        expect(res.text).to.not.include('Andrews, Eligibility');
                        expect(res.text).to.not.include('Andrews, Approval');
                        expect(res.text).to.not.include('Andrews, Approved');
                        expect(res.text).to.not.include('Andrews, Refused');
                        expect(res.text).to.not.include('Andrews, Processing CA not postponed');
                        expect(res.text).to.not.include('Andrews, Processing CA postponed');
                    });
            });
        });
        context('tab is submittedRo', () => {
            it('should filter out offenders at a stage that isnt PROCESSING_CA', () => {
                return request(app)
                    .get('/finalChecks')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Andrews, RO Processing');
                        expect(res.text).to.not.include('Andrews, Unstarted');
                        expect(res.text).to.not.include('Andrews, Eligibility');
                        expect(res.text).to.not.include('Andrews, Approval');
                        expect(res.text).to.not.include('Andrews, Approved');
                        expect(res.text).to.not.include('Andrews, Refused');
                        expect(res.text).to.include('Andrews, Processing CA not postponed');
                        expect(res.text).to.include('Andrews, Processing CA postponed');
                    });
            });
        });
        context('tab is submitterDm', () => {
            it('should filter out offenders at a stage that isnt APPROVAL', () => {
                return request(app)
                    .get('/submittedDm')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Andrews, RO Processing');
                        expect(res.text).to.not.include('Andrews, Unstarted');
                        expect(res.text).to.not.include('Andrews, Eligibility');
                        expect(res.text).to.include('Andrews, Approval');
                        expect(res.text).to.not.include('Andrews, Approved');
                        expect(res.text).to.not.include('Andrews, Refused');
                        expect(res.text).to.not.include('Andrews, Processing CA not postponed');
                        expect(res.text).to.not.include('Andrews, Processing CA postponed');
                    });
            });
        });
        context('tab is approved', () => {
            it('should filter out offenders at a stage that isnt DECIDED with status of Approved', () => {
                return request(app)
                    .get('/approved')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Andrews, RO Processing');
                        expect(res.text).to.not.include('Andrews, Unstarted');
                        expect(res.text).to.not.include('Andrews, Eligibility');
                        expect(res.text).to.not.include('Andrews, Approval');
                        expect(res.text).to.include('Andrews, Approved');
                        expect(res.text).to.not.include('Andrews, Refused');
                        expect(res.text).to.not.include('Andrews, Processing CA not postponed');
                        expect(res.text).to.not.include('Andrews, Processing CA postponed');
                    });
            });
        });
        context('tab is refused', () => {
            it('should filter out offenders at a stage that isnt DECIDED with status of Refused', () => {
                return request(app)
                    .get('/refused')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Andrews, RO Processing');
                        expect(res.text).to.not.include('Andrews, Unstarted');
                        expect(res.text).to.not.include('Andrews, Eligibility');
                        expect(res.text).to.not.include('Andrews, Approval');
                        expect(res.text).to.not.include('Andrews, Approved');
                        expect(res.text).to.include('Andrews, Refused');
                        expect(res.text).to.not.include('Andrews, Processing CA not postponed');
                        expect(res.text).to.not.include('Andrews, Processing CA postponed');
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
            authenticationMiddleware
        }), testUser);

        beforeEach(() => {
            caseListServiceStub.getHdcCaseList.resolves(caseListResponse);
        });

        context('tab is ready', () => {
            it('should filter out offenders at a stage that isnt PROCESSING_RO', () => {
                return request(app)
                    .get('/ready')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.include('Andrews, RO Processing');
                        expect(res.text).to.not.include('Andrews, Unstarted');
                        expect(res.text).to.not.include('Andrews, Eligibility');
                        expect(res.text).to.not.include('Andrews, Approval');
                        expect(res.text).to.not.include('Andrews, Approved');
                        expect(res.text).to.not.include('Andrews, Refused');
                    });
            });
        });
        context('tab is submittedPca', () => {
            it('should filter out offenders at a stage that isnt PROCESSING_CA not postponed or APPROVAL', () => {
                return request(app)
                    .get('/submittedPca')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Andrews, RO Processing');
                        expect(res.text).to.not.include('Andrews, Unstarted');
                        expect(res.text).to.not.include('Andrews, Eligibility');
                        expect(res.text).to.include('Andrews, Approval');
                        expect(res.text).to.not.include('Andrews, Approved');
                        expect(res.text).to.not.include('Andrews, Refused');
                        expect(res.text).to.include('Andrews, Processing CA not postponed');
                        expect(res.text).to.not.include('Andrews, Processing CA postponed');
                    });
            });
        });
        context('tab is postponed', () => {
            it('should filter out offenders at a stage that isnt PROCESSING_CA with status postponed', () => {
                return request(app)
                    .get('/postponed')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Andrews, RO Processing');
                        expect(res.text).to.not.include('Andrews, Unstarted');
                        expect(res.text).to.not.include('Andrews, Eligibility');
                        expect(res.text).to.not.include('Andrews, Approval');
                        expect(res.text).to.not.include('Andrews, Approved');
                        expect(res.text).to.not.include('Andrews, Refused');
                        expect(res.text).to.not.include('Andrews, Processing CA not postponed');
                        expect(res.text).to.include('Andrews, Processing CA postponed');
                    });
            });
        });
        context('tab is approved', () => {
            it('should filter out offenders at a stage that isnt DECIDED', () => {
                return request(app)
                    .get('/active')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Andrews, RO Processing');
                        expect(res.text).to.not.include('Andrews, Unstarted');
                        expect(res.text).to.not.include('Andrews, Eligibility');
                        expect(res.text).to.not.include('Andrews, Approval');
                        expect(res.text).to.include('Andrews, Approved');
                        expect(res.text).to.include('Andrews, Refused');
                        expect(res.text).to.not.include('Andrews, Processing CA not postponed');
                        expect(res.text).to.not.include('Andrews, Processing CA postponed');
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
            authenticationMiddleware
        }), testUser);

        context('tab is ready', () => {
            it('should filter out offenders at a stage that isnt PROCESSING_RO', () => {
                return request(app)
                    .get('/ready')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.include('Andrews, RO Processing');
                        expect(res.text).to.not.include('Andrews, Unstarted');
                        expect(res.text).to.not.include('Andrews, Eligibility');
                        expect(res.text).to.not.include('Andrews, Approval');
                        expect(res.text).to.not.include('Andrews, Approved');
                        expect(res.text).to.not.include('Andrews, Refused');
                    });
            });
        });
        context('tab is submittedPca', () => {
            it('should filter out offenders at a stage that isnt PROCESSING_CA or APPROVAL', () => {
                return request(app)
                    .get('/submittedPca')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Andrews, RO Processing');
                        expect(res.text).to.not.include('Andrews, Unstarted');
                        expect(res.text).to.not.include('Andrews, Eligibility');
                        expect(res.text).to.include('Andrews, Approval');
                        expect(res.text).to.not.include('Andrews, Approved');
                        expect(res.text).to.not.include('Andrews, Refused');
                        expect(res.text).to.include('Andrews, Processing CA not postponed');
                        expect(res.text).to.not.include('Andrews, Processing CA postponed');
                    });
            });
        });
        context('tab is postponed', () => {
            it('should filter out offenders at a stage that isnt PROCESSING_CA with status postponed', () => {
                return request(app)
                    .get('/postponed')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Andrews, RO Processing');
                        expect(res.text).to.not.include('Andrews, Unstarted');
                        expect(res.text).to.not.include('Andrews, Eligibility');
                        expect(res.text).to.not.include('Andrews, Approval');
                        expect(res.text).to.not.include('Andrews, Approved');
                        expect(res.text).to.not.include('Andrews, Refused');
                        expect(res.text).to.not.include('Andrews, Processing CA not postponed');
                        expect(res.text).to.include('Andrews, Processing CA postponed');
                    });
            });
        });
        context('tab is approved', () => {
            it('should filter out offenders at a stage that isnt DECIDED', () => {
                return request(app)
                    .get('/active')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Andrews, RO Processing');
                        expect(res.text).to.not.include('Andrews, Unstarted');
                        expect(res.text).to.not.include('Andrews, Eligibility');
                        expect(res.text).to.not.include('Andrews, Approval');
                        expect(res.text).to.include('Andrews, Approved');
                        expect(res.text).to.include('Andrews, Refused');
                        expect(res.text).to.not.include('Andrews, Processing CA not postponed');
                        expect(res.text).to.not.include('Andrews, Processing CA postponed');
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
            authenticationMiddleware
        }), testUser);

        context('tab is ready', () => {
            it('should filter out offenders at a stage that isnt APPROVAL', () => {
                return request(app)
                    .get('/ready')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Andrews, RO Processing');
                        expect(res.text).to.not.include('Andrews, Unstarted');
                        expect(res.text).to.not.include('Andrews, Eligibility');
                        expect(res.text).to.include('Andrews, Approval');
                        expect(res.text).to.not.include('Andrews, Approved');
                        expect(res.text).to.not.include('Andrews, Refused');
                        expect(res.text).to.not.include('Andrews, Processing CA not postponed');
                        expect(res.text).to.not.include('Andrews, Processing CA postponed');
                    });
            });
        });
        context('tab is submittedPca', () => {
            it('should filter out offenders at a stage that isnt DECIDED with status Approved', () => {
                return request(app)
                    .get('/approved')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Andrews, RO Processing');
                        expect(res.text).to.not.include('Andrews, Unstarted');
                        expect(res.text).to.not.include('Andrews, Eligibility');
                        expect(res.text).to.not.include('Andrews, Approval');
                        expect(res.text).to.include('Andrews, Approved');
                        expect(res.text).to.not.include('Andrews, Refused');
                        expect(res.text).to.not.include('Andrews, Processing CA not postponed');
                        expect(res.text).to.not.include('Andrews, Processing CA postponed');
                    });
            });
        });
        context('tab is refused', () => {
            it('should filter out offenders at a stage that isnt DECIDED with status Refused', () => {
                return request(app)
                    .get('/refused')
                    .expect(200)
                    .expect(res => {
                        expect(res.text).to.not.include('Andrews, RO Processing');
                        expect(res.text).to.not.include('Andrews, Unstarted');
                        expect(res.text).to.not.include('Andrews, Eligibility');
                        expect(res.text).to.not.include('Andrews, Approval');
                        expect(res.text).to.not.include('Andrews, Approved');
                        expect(res.text).to.include('Andrews, Refused');
                        expect(res.text).to.not.include('Andrews, Processing CA not postponed');
                        expect(res.text).to.not.include('Andrews, Processing CA postponed');
                    });
            });
        });
    });
});
