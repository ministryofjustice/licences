const {createPrisonerService} = require('../../server/services/prisonerService');
const {
    sandbox,
    expect
} = require('../testSetup');

describe('prisonerDetailsService', () => {

    const prisonerResponse = [{bookingId: 1, facialImageId: 2, agencyLocationId: 'ABC'}];

    const sentenceDetailResponse = {sentenceExpiryDate: '1985-12-03'};
    const aliasesResponse = [{firstName: 'ALIAS', lastName: 'One'}, {firstName: 'AKA', lastName: 'Two'}];
    const mainOffenceResponse = [{offenceDescription: 'Robbery, conspiracy to rob'}];
    const comRelationResponse = [{firstName: 'COMFIRST', lastName: 'comLast'}];

    const imageInfoResponse = {imageId: 'imgId', captureDate: '1971-11-23'};
    const imageDataResponse = new Buffer('image');

    const establishmentResponse = {premise: 'HMP Licence Test Prison'};

    const nomisClientMock = {
        getHdcEligiblePrisoner: sandbox.stub().returnsPromise().resolves(prisonerResponse),
        getSentenceDetail: sandbox.stub().returnsPromise().resolves(sentenceDetailResponse),
        getAliases: sandbox.stub().returnsPromise().resolves(aliasesResponse),
        getMainOffence: sandbox.stub().returnsPromise().resolves(mainOffenceResponse),
        getComRelation: sandbox.stub().returnsPromise().resolves(comRelationResponse),
        getImageInfo: sandbox.stub().returnsPromise().resolves(imageInfoResponse),
        getImageData: sandbox.stub().returnsPromise().resolves(imageDataResponse),
        getEstablishment: sandbox.stub().returnsPromise().resolves(establishmentResponse),
        getComRelation: sandbox.stub().returnsPromise().resolves(comRelationResponse)
    };

    const nomisClientBuilder = sandbox.stub().returns(nomisClientMock);

    const prisonerInfoResponse = {
        bookingId: 1,
        facialImageId: 2,
        imageId: 'imgId',
        captureDate: '23/11/1971',
        aliases: 'Alias One, Aka Two',
        offences: 'Robbery, conspiracy to rob',
        com: 'Comfirst Comlast',
        agencyLocationId: 'ABC'
    };


    const service = createPrisonerService(nomisClientBuilder);

    afterEach(() => {
        sandbox.reset();
    });

    describe('getPrisonerDetails', () => {

        it('should call the api with the nomis id', async () => {
            await service.getPrisonerDetails('123');

            expect(nomisClientMock.getHdcEligiblePrisoner).to.be.calledOnce();
            expect(nomisClientMock.getAliases).to.be.calledOnce();
            expect(nomisClientMock.getMainOffence).to.be.calledOnce();
            expect(nomisClientMock.getComRelation).to.be.calledOnce();
            expect(nomisClientMock.getImageInfo).to.be.calledOnce();

            expect(nomisClientMock.getHdcEligiblePrisoner).to.be.calledWith('123');
            expect(nomisClientMock.getAliases).to.be.calledWith(1);
            expect(nomisClientMock.getMainOffence).to.be.calledWith(1);
            expect(nomisClientMock.getComRelation).to.be.calledWith(1);
            expect(nomisClientMock.getImageInfo).to.be.calledWith(2);
        });

        it('should return the result of the api call', () => {
            return expect(service.getPrisonerDetails('123'))
                .to.eventually.eql(prisonerInfoResponse);
        });

        it('should throw if error in api', () => {
            nomisClientMock.getHdcEligiblePrisoner.rejects(new Error('dead'));

            return expect(service.getPrisonerDetails('123')).to.be.rejected();
        });

        it('it should return false for imageId of no image', async () => {

            const prisonerResponse2 = [{bookingId: 1, facialImageId: null}];

            nomisClientMock.getHdcEligiblePrisoner.resolves(prisonerResponse2);

            const result = await service.getPrisonerDetails('123');
            return expect(result.imageId).to.eql(false);
        });
    });

    describe('getPrisonerImage', () => {
        it('should call getImageData with the imageId', async () => {
            await service.getPrisonerImage('123', 'token');

            expect(nomisClientMock.getImageData).to.be.calledOnce();
            expect(nomisClientMock.getImageData).to.be.calledWith('123');
        });

        it('should return the image', async () => {
            return expect(service.getPrisonerImage('123', 'token')).to.eventually.eql(imageDataResponse);
        });

        it('should return null if no image', async () => {
            nomisClientMock.getImageData.resolves(null);
            return expect(service.getPrisonerImage('123', 'token')).to.eventually.eql(null);
        });

        it('should return null if no image', async () => {
            nomisClientMock.getImageData.rejects({message: 'not found'});
            return expect(service.getPrisonerImage('123', 'token')).to.eventually.eql(null);
        });
    });

    describe('getEstablishmentForPrisoner', () => {

        it('should call the api with the nomis id', async () => {

            nomisClientMock.getHdcEligiblePrisoner.resolves(prisonerResponse);

            await service.getEstablishmentForPrisoner('123', 'token');

            expect(nomisClientMock.getHdcEligiblePrisoner).to.be.calledOnce();
            expect(nomisClientMock.getEstablishment).to.be.calledOnce();
            expect(nomisClientMock.getHdcEligiblePrisoner).to.be.calledWith('123');
            expect(nomisClientMock.getEstablishment).to.be.calledWith('ABC');
        });

        it('should return the result of the api call', () => {
            return expect(service.getEstablishmentForPrisoner('123'))
                .to.eventually.eql(establishmentResponse);
        });

        it('should throw if error in api when getting prisoner', () => {
            nomisClientMock.getHdcEligiblePrisoner.rejects(new Error('dead'));
            return expect(service.getEstablishmentForPrisoner('123')).to.be.rejected();
        });

        it('should throw if error in api when getting establishment', () => {
            nomisClientMock.getHdcEligiblePrisoner.resolves(prisonerResponse);
            nomisClientMock.getEstablishment.rejects(new Error('dead'));
            return expect(service.getEstablishmentForPrisoner('123')).to.be.rejected();
        });

        it('should NOT throw but return null if 404 in api when getting establishment', () => {
            nomisClientMock.getHdcEligiblePrisoner.resolves(prisonerResponse);
            nomisClientMock.getEstablishment.rejects({status: 404});
            return expect(service.getEstablishmentForPrisoner('123')).to.eventually.eql(null);
        });

        it('should throw if error in api when getting establishment if error ststus other than 404', () => {
            nomisClientMock.getHdcEligiblePrisoner.resolves(prisonerResponse);
            nomisClientMock.getEstablishment.rejects({status: 401});
            return expect(service.getEstablishmentForPrisoner('123')).to.be.rejected();
        });
    });

    describe('getComForPrisoner', () => {

        it('should call the api with the nomis id', async () => {

            nomisClientMock.getHdcEligiblePrisoner.resolves(prisonerResponse);

            await service.getComForPrisoner('123', 'token');

            expect(nomisClientMock.getHdcEligiblePrisoner).to.be.calledOnce();
            expect(nomisClientMock.getComRelation).to.be.calledOnce();
            expect(nomisClientMock.getHdcEligiblePrisoner).to.be.calledWith('123');
            expect(nomisClientMock.getComRelation).to.be.calledWith(1);
        });

        it('should return the result of the api call', () => {

            const expectedComData = {
                com: 'Comfirst Comlast'
            };

            return expect(service.getComForPrisoner('123'))
                .to.eventually.eql(expectedComData);
        });

        it('should throw if error in api when getting prisoner', () => {
            nomisClientMock.getHdcEligiblePrisoner.rejects(new Error('dead'));
            return expect(service.getComForPrisoner('123')).to.be.rejected();
        });

        it('should throw if error in api when getting establishment', () => {
            nomisClientMock.getHdcEligiblePrisoner.resolves(prisonerResponse);
            nomisClientMock.getComRelation.rejects(new Error('dead'));
            return expect(service.getComForPrisoner('123')).to.be.rejected();
        });

        it('should NOT throw but return null if 404 in api when getting establishment', () => {
            nomisClientMock.getHdcEligiblePrisoner.resolves(prisonerResponse);
            nomisClientMock.getComRelation.rejects({status: 404});
            return expect(service.getComForPrisoner('123')).to.eventually.eql(null);
        });

        it('should throw if error in api when getting establishment if error ststus other than 404', () => {
            nomisClientMock.getHdcEligiblePrisoner.resolves(prisonerResponse);
            nomisClientMock.getComRelation.rejects({status: 401});
            return expect(service.getComForPrisoner('123')).to.be.rejected();
        });
    });
});
