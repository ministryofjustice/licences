const createLicenceService = require('../../server/services/licenceService');
const {expect, sandbox} = require('../testSetup');

describe('licenceDetailsService', () => {

    const licenceClient = {
        getLicence: sandbox.stub().returnsPromise().resolves({a: 'b'}),
        createLicence: sandbox.stub().returnsPromise().resolves('abc'),
        updateSection: sandbox.stub().returnsPromise().resolves(),
        updateStatus: sandbox.stub().returnsPromise().resolves()
    };

    const service = createLicenceService(licenceClient);

    afterEach(() => {
        sandbox.reset();
    });

    describe('getLicence', () => {
        it('should request licence details from client', () => {
            service.getLicence('123');

            expect(licenceClient.getLicence).to.be.calledOnce();
            expect(licenceClient.getLicence).to.be.calledWith('123');
        });

        it('should return licence', () => {
            return expect(service.getLicence('123')).to.eventually.eql({a: 'b'});
        });

        it('should throw if error getting licence', () => {
            licenceClient.getLicence.rejects();
            return expect(service.getLicence('123')).to.eventually.be.rejected();
        });
    });

    describe('createLicence', () => {
        it('should create a licence', () => {
            service.createLicence('123');

            expect(licenceClient.createLicence).to.be.calledOnce();
            expect(licenceClient.createLicence).to.be.calledWith('123', {});
        });

        it('should pass in a valid licence', () => {
            service.createLicence('123', {firstName: 'M', bad: '1'});

            expect(licenceClient.createLicence).to.be.calledOnce();
            expect(licenceClient.createLicence).to.be.calledWith('123', {firstName: 'M'});
        });

        it('should return returned id', () => {
            return expect(service.createLicence('123')).to.eventually.eql('abc');
        });

        it('should throw if error getting licence', () => {
            licenceClient.createLicence.rejects();
            return expect(service.createLicence('123')).to.eventually.be.rejected();
        });
    });

    describe('updatesAddress', () => {
        it('should call updateAddress from the licence client', () => {
            service.updateAddress({nomisId: 'ab1', address1: 'Scotland Street'});

            expect(licenceClient.updateSection).to.be.calledOnce();
            expect(licenceClient.updateSection).to.be.calledWith(
                'dischargeAddress',
                'ab1',
                {address1: 'Scotland Street'}
            );
        });

        it('should throw if error updating licence', () => {
            licenceClient.updateSection.rejects();
            const args = {nomisId: 'ab1', address1: 'Scotland Street'};
            return expect(service.updateAddress(args)).to.eventually.be.rejected();
        });
    });

    describe('updatesReportingInstructions', () => {
        it('should call updatesReportingInstructions from the licence client', () => {
            service.updateReportingInstructions({nomisId: 'ab1', address1: 'Scotland Street'});

            expect(licenceClient.updateSection).to.be.calledOnce();
            expect(licenceClient.updateSection).to.be.calledWith(
                'reportingInstructions',
                'ab1',
                {address1: 'Scotland Street'}
            );
        });

        it('should throw if error updating licence', () => {
            licenceClient.updateSection.rejects();
            const args = {nomisId: 'ab1', address1: 'Scotland Street'};
            return expect(service.updateReportingInstructions(args)).to.eventually.be.rejected();
        });
    });

    describe('send', () => {
        it('should call updateStatus from the licence client', () => {
            service.send('ab1');

            expect(licenceClient.updateStatus).to.be.calledOnce();
            expect(licenceClient.updateStatus).to.be.calledWith('ab1', 'SENT');
        });

        it('should throw if error during update status', () => {
            licenceClient.updateStatus.rejects();
            return expect(service.send('ab1')).to.eventually.be.rejected();
        });
    });
});
