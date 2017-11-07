const createLicenceService = require('../../server/services/licenceService');
const {expect, sandbox} = require('../testSetup');

describe('licenceDetailsService', () => {

    const aLicence = {a: 'b', licence: {agencyLocationId: '123'}};

    const licenceClient = {
        getLicence: sandbox.stub().returnsPromise().resolves({licence: {a: 'b'}}),
        createLicence: sandbox.stub().returnsPromise().resolves('abc'),
        updateSection: sandbox.stub().returnsPromise().resolves(),
        updateStatus: sandbox.stub().returnsPromise().resolves(),
        getAdditionalConditions: sandbox.stub().returnsPromise().resolves([{USER_INPUT: {value: 1}, ID: {value: 1}}])
    };

    const establishmentsClient = {
        findById: sandbox.stub().returnsPromise().resolves({a: 'b'})
    };

    const service = createLicenceService(licenceClient, establishmentsClient);

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

        it('should addAdditionalConditions if they are present in licence', () => {
            licenceClient.getLicence.resolves({licence: {additionalConditions: {1: {}}}});
            licenceClient.getAdditionalConditions.resolves([{
                ID: {value: 1},
                USER_INPUT: {value: null},
                TEXT: {value: 'The condition'}}]);

            return expect(service.getLicence('123')).to.eventually.eql({additionalConditions: ['The condition']});
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

    describe('updateLicenceConditions', () => {

        it('should get the selected licence conditions', () => {
            service.updateLicenceConditions({nomisId: 'ab1', additionalConditions: ['Scotland Street']});

            expect(licenceClient.getAdditionalConditions).to.be.calledOnce();
            expect(licenceClient.getAdditionalConditions).to.be.calledWith(['Scotland Street']);
        });

        it('should call update section with additional conditions from the licence client', async () => {
            await service.updateLicenceConditions({nomisId: 'ab1', additionalConditions: ['Scotland Street']});

            expect(licenceClient.updateSection).to.be.calledOnce();
            expect(licenceClient.updateSection).to.be.calledWith(
                'additionalConditions',
                'ab1',
                {1: {}}
            );
        });

        it('should throw if error updating licence', () => {
            licenceClient.updateSection.rejects();
            const args = {nomisId: 'ab1', additionalConditions: ['Scotland Street']};
            return expect(service.updateLicenceConditions(args)).to.eventually.be.rejected();
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

    describe('getEstablishment', () => {
        it('should call getEstablishment from the establishments client', async () => {

            licenceClient.getLicence.resolves(aLicence);

            await service.getEstablishment('ab1');

            expect(licenceClient.getLicence).to.be.calledOnce();
            expect(licenceClient.getLicence).to.be.calledWith('ab1');
            expect(establishmentsClient.findById).to.be.calledOnce();
            expect(establishmentsClient.findById).to.be.calledWith('123');
        });

        it('should throw if error during findById', () => {
            establishmentsClient.findById.rejects();
            return expect(service.getEstablishment('ab1')).to.eventually.be.rejected();
        });
    });
});
