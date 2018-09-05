const request = require('supertest');

const {
    loggerStub,
    userServiceStub,
    authenticationMiddleware,
    auditStub,
    appSetup
} = require('../supertestSetup');

const createAdminRoute = require('../../server/routes/admin/admin');
const adminRoute = createAdminRoute({
    userService: userServiceStub,
    logger: loggerStub,
    authenticationMiddleware,
    audit: auditStub
});

let app;

const user1 = {
    nomis_id: 'user1',
    staff_id: 'd1',
    first_name: 'f1',
    last_name: 'l1'
};

const user2 = {
    nomis_id: 'user2',
    staff_id: 'd2',
    first_name: 'f2',
    last_name: 'l2'
};

describe('/admin', () => {

    beforeEach(() => {
        app = appSetup(adminRoute, 'batchUser', '/admin/');

        auditStub.record.reset();

        userServiceStub.findRoUsers.reset();
        userServiceStub.getRoUsers.reset();
        userServiceStub.getRoUser.reset();

        userServiceStub.getRoUsers.resolves([user1, user2]);
        userServiceStub.findRoUsers.resolves([user1]);
        userServiceStub.getRoUser.resolves(user1);
    });

    describe('GET /admin', () => {

        it('redirects to ro user list', () => {
            return request(app)
                .get('/admin/')
                .expect(302)
                .expect('Location', '/admin/roUsers');
        });
    });


    describe('GET /admin/roUsers', () => {

        it('calls user service and renders HTML output', () => {
            return request(app)
                .get('/admin/roUsers')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(() => {
                    expect(userServiceStub.getRoUsers).to.be.calledOnce();
                });
        });

        it('should display the user details', () => {
            return request(app)
                .get('/admin/roUsers')
                .expect(200)
                .expect(res => {
                    expect(res.text).to.contain('user1');
                    expect(res.text).to.contain('user2');
                });
        });

        it('should throw if submitted by non-authorised user', () => {
            app = appSetup(adminRoute, 'roUser', '/admin/');
            return request(app)
                .get('/admin/roUsers')
                .expect(403);
        });
    });

    describe('POST /admin/roUsers', () => {

        it('redirects back to page and does not call user service when no search term', () => {
            return request(app)
                .post('/admin/roUsers')
                .send({searchTerm: '  '})
                .expect(302)
                .expect(res => {
                    expect(userServiceStub.findRoUsers).not.to.be.calledOnce();
                });
        });

        it('calls user service and renders HTML output', () => {
            return request(app)
                .post('/admin/roUsers')
                .send({searchTerm: 'aQuery'})
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(userServiceStub.findRoUsers).to.be.calledOnce();
                    expect(userServiceStub.findRoUsers).to.be.calledWith('aQuery');
                    expect(res.text).to.contain('user1');
                    expect(res.text).not.to.contain('user2');
                });
        });
    });

    describe('GET /admin/roUsers/edit', () => {

        it('calls user service and shows user details', () => {
            return request(app)
                .get('/admin/roUsers/edit/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(userServiceStub.getRoUser).to.be.calledOnce();
                    expect(userServiceStub.getRoUser).to.be.calledWith('1');
                    expect(res.text).to.contain('value="user1"');
                    expect(res.text).to.contain('value="d1"');
                    expect(res.text).to.contain('value="f1"');
                    expect(res.text).to.contain('value="l1"');
                });
        });
    });

    describe('POST /admin/roUsers/edit', () => {

        it('redirects back to page and does not call user service when missing delius id', () => {
            return request(app)
                .post('/admin/roUsers/edit/1')
                .send({newNomisId: '1', deliusId: '', newDeliusId: '', first: 'f', last: 'l'})
                .expect(302)
                .expect('Location', '/admin/roUsers/edit/1')
                .expect(res => {
                    expect(userServiceStub.findRoUsers).not.to.be.calledOnce();
                });
        });

        it('calls user service and redirects to user list', () => {
            return request(app)
                .post('/admin/roUsers/edit/1')
                .send({newNomisId: '1n', deliusId: 'd', newDeliusId: 'dn', first: 'f', last: 'l'})
                .expect(302)
                .expect('Location', '/admin/roUsers')
                .expect(res => {
                    expect(userServiceStub.updateRoUser).to.be.calledOnce();
                    expect(userServiceStub.updateRoUser).to.be.calledWith('1', {
                        deliusId: 'd',
                        first: 'f',
                        last: 'l',
                        newDeliusId: 'dn',
                        newNomisId: '1n'
                    });
                });
        });

        it('Audits the edit user event', () => {

            return request(app)
                .post('/admin/roUsers/edit/1')
                .send({newNomisId: 'nid', newDeliusId: 'did'})
                .expect(302)
                .expect('Location', '/admin/roUsers')
                .expect(res => {
                    expect(auditStub.record).to.be.calledOnce();
                    expect(auditStub.record).to.be.calledWith(
                        'USER_MANAGEMENT', 'id', {
                            action: ['1'],
                            bookingId: undefined,
                            formName: 'edit',
                            sectionName: 'roUsers',
                            userInput: {newNomisId: 'nid', newDeliusId: 'did'}
                        });
                });
        });
    });

    describe('GET /admin/roUsers/delete', () => {

        it('calls user service and shows user details', () => {
            return request(app)
                .get('/admin/roUsers/delete/1')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(userServiceStub.getRoUser).to.be.calledOnce();
                    expect(userServiceStub.getRoUser).to.be.calledWith('1');
                    expect(res.text).to.contain('nomisId">user1');
                    expect(res.text).to.contain('deliusId">d1');
                    expect(res.text).to.contain('firstName">f1');
                    expect(res.text).to.contain('lastName">l1');
                });
        });
    });

    describe('POST /admin/roUsers/delete', () => {

        it('calls user service and redirects to user list', () => {
            return request(app)
                .post('/admin/roUsers/delete/1')
                .send()
                .expect(302)
                .expect('Location', '/admin/roUsers')
                .expect(res => {
                    expect(userServiceStub.deleteRoUser).to.be.calledOnce();
                    expect(userServiceStub.deleteRoUser).to.be.calledWith('1');
                });
        });

        it('Audits the delete user event', () => {

            return request(app)
                .post('/admin/roUsers/delete/1')
                .expect(302)
                .expect('Location', '/admin/roUsers')
                .expect(res => {
                    expect(auditStub.record).to.be.calledOnce();
                    expect(auditStub.record).to.be.calledWith(
                        'USER_MANAGEMENT', 'id', {
                            action: ['1'],
                            bookingId: undefined,
                            formName: 'delete',
                            sectionName: 'roUsers',
                            userInput: {}
                        });
                });
        });
    });

    describe('GET /admin/roUsers/add', () => {

        it('shows add user form', () => {
            return request(app)
                .get('/admin/roUsers/add/')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(res => {
                    expect(res.text).to.contain('Add RO user');
                });
        });
    });

    describe('POST /admin/roUsers/add', () => {

        it('redirects back to page and does not call user service when missing nomis id', () => {
            return request(app)
                .post('/admin/roUsers/add/')
                .send({newNomisId: '   ', newDeliusId: 'delius', first: 'first', last: 'last'})
                .expect(302)
                .expect('Location', '/admin/roUsers/add')
                .expect(res => {
                    expect(userServiceStub.addRoUser).not.to.be.calledOnce();
                });
        });

        it('redirects back to page and does not call user service when missing delius id', () => {
            return request(app)
                .post('/admin/roUsers/add/')
                .send({newNomisId: 'nomisId', newDeliusId: '  ', first: 'first', last: 'last'})
                .expect(302)
                .expect('Location', '/admin/roUsers/add')
                .expect(res => {
                    expect(userServiceStub.addRoUser).not.to.be.calledOnce();
                });
        });

        it('calls user service and redirects to user list', () => {
            return request(app)
                .post('/admin/roUsers/add/')
                .send({newNomisId: 'nomisId', newDeliusId: 'deliusId', first: 'first', last: 'last'})
                .expect(302)
                .expect('Location', '/admin/roUsers')
                .expect(res => {
                    expect(userServiceStub.addRoUser).to.be.calledOnce();
                    expect(userServiceStub.addRoUser).to.be.calledWith({
                        newDeliusId: 'deliusId',
                        first: 'first',
                        last: 'last',
                        newNomisId: 'nomisId'
                    });
                });
        });

        it('Audits the add user event', () => {

            return request(app)
                .post('/admin/roUsers/add/')
                .send({newNomisId: 'nid', newDeliusId: 'did'})
                .expect(302)
                .expect('Location', '/admin/roUsers')
                .expect(res => {
                    expect(auditStub.record).to.be.calledOnce();
                    expect(auditStub.record).to.be.calledWith(
                        'USER_MANAGEMENT', 'id', {
                            action: [],
                            bookingId: undefined,
                            formName: 'add',
                            sectionName: 'roUsers',
                            userInput: {newNomisId: 'nid', newDeliusId: 'did'}
                        });
                });
        });
    });
});

