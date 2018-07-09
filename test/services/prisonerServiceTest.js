const {createPrisonerService} = require('../../server/services/prisonerService');

describe('prisonerDetailsService', () => {
    let nomisClientMock;
    let service;

    const hdcPrisonersResponse = [{bookingId: 1, facialImageId: 2, agencyLocationId: 'ABC', middleName: 'Middle'}];
    const identifiersResponse = [{type: 'PNC', value: 'PNC001'}, {type: 'CRO', value: 'CRO001'}];
    const aliasesResponse = [{firstName: 'ALIAS', lastName: 'One'}, {firstName: 'AKA', lastName: 'Two'}];
    const mainOffenceResponse = [{offenceDescription: 'Robbery, conspiracy to rob'}];
    const comRelationResponse = [{firstName: 'COMFIRST', lastName: 'comLast'}];
    const imageInfoResponse = {imageId: 'imgId', captureDate: '1971-11-23'};
    const imageDataResponse = Buffer.from('image');
    const establishmentResponse = {premise: 'HMP Licence Test Prison'};
    const prisonerInfoResponse = {
        bookingId: 1,
        facialImageId: 2,
        imageId: 'imgId',
        captureDate: '23/11/1971',
        aliases: 'Alias One, Aka Two',
        offences: 'Robbery, conspiracy to rob',
        com: 'Comfirst Comlast',
        agencyLocationId: 'ABC',
        CRO: 'CRO001',
        PNC: 'PNC001',
        middleName: 'Middle'
    };

    beforeEach(() => {
        nomisClientMock = {
            getOffenderSentences: sinon.stub().resolves(hdcPrisonersResponse),
            getIdentifiers: sinon.stub().resolves(identifiersResponse),
            getAliases: sinon.stub().resolves(aliasesResponse),
            getMainOffence: sinon.stub().resolves(mainOffenceResponse),
            getImageInfo: sinon.stub().resolves(imageInfoResponse),
            getImageData: sinon.stub().resolves(imageDataResponse),
            getEstablishment: sinon.stub().resolves(establishmentResponse),
            getComRelation: sinon.stub().resolves(comRelationResponse)
        };
        const nomisClientBuilder = sinon.stub().returns(nomisClientMock);
        service = createPrisonerService(nomisClientBuilder);
    });

    describe('getPrisonerDetails', () => {
        it('should call the api with the nomis id then booking id', async () => {
            await service.getPrisonerDetails('123', 'username');

            expect(nomisClientMock.getOffenderSentences).to.be.calledOnce();
            expect(nomisClientMock.getAliases).to.be.calledOnce();
            expect(nomisClientMock.getMainOffence).to.be.calledOnce();
            expect(nomisClientMock.getComRelation).to.be.calledOnce();
            expect(nomisClientMock.getImageInfo).to.be.calledOnce();
            expect(nomisClientMock.getIdentifiers).to.be.calledOnce();

            expect(nomisClientMock.getOffenderSentences).to.be.calledWith('123');
            expect(nomisClientMock.getAliases).to.be.calledWith(1);
            expect(nomisClientMock.getMainOffence).to.be.calledWith(1);
            expect(nomisClientMock.getComRelation).to.be.calledWith(1);
            expect(nomisClientMock.getImageInfo).to.be.calledWith(2);
            expect(nomisClientMock.getIdentifiers).to.be.calledWith(1);
        });

        it('should return the result of the api call', () => {
            return expect(service.getPrisonerDetails('123', 'username'))
                .to.eventually.eql(prisonerInfoResponse);
        });

        it('should return the only selected identifiers', () => {
            const identifiersResponseWithOthers = [
                {type: 'PNC', value: 'PNC001'},
                {type: 'IGNORE', value: 'IGNORE001'},
                {type: 'CRO', value: 'CRO001'}
            ];

            nomisClientMock.getIdentifiers.resolves(identifiersResponseWithOthers);

            return expect(service.getPrisonerDetails('123', 'username'))
                .to.eventually.eql(prisonerInfoResponse);
        });

        it('should throw if error in api', () => {
            nomisClientMock.getOffenderSentences.rejects(new Error('dead'));

            return expect(service.getPrisonerDetails('123', 'username')).to.be.rejected();
        });

        it('it should return false for imageId of no image', async () => {
            const prisonerResponse2 = [{bookingId: 1, facialImageId: null}];

            nomisClientMock.getOffenderSentences.resolves(prisonerResponse2);

            const result = await service.getPrisonerDetails('123', 'username');
            return expect(result.imageId).to.eql(false);
        });
    });

    describe('getPrisonerImage', () => {
        it('should call getImageData with the imageId', async () => {
            await service.getPrisonerImage('123', 'username');

            expect(nomisClientMock.getImageData).to.be.calledOnce();
            expect(nomisClientMock.getImageData).to.be.calledWith('123');
        });

        it('should return the image', async () => {
            return expect(service.getPrisonerImage('123', 'username')).to.eventually.eql(imageDataResponse);
        });

        it('should return null if no image', async () => {
            nomisClientMock.getImageData.resolves(null);
            return expect(service.getPrisonerImage('123', 'username')).to.eventually.eql(null);
        });

        it('should return null if no image', async () => {
            nomisClientMock.getImageData.rejects({message: 'not found'});
            return expect(service.getPrisonerImage('123', 'username')).to.eventually.eql(null);
        });
    });

    describe('getEstablishmentForPrisoner', () => {
        it('should call the api with the nomis id', async () => {

            nomisClientMock.getOffenderSentences.resolves(hdcPrisonersResponse);

            await service.getEstablishmentForPrisoner('123', 'username');

            expect(nomisClientMock.getOffenderSentences).to.be.calledOnce();
            expect(nomisClientMock.getEstablishment).to.be.calledOnce();
            expect(nomisClientMock.getOffenderSentences).to.be.calledWith('123');
            expect(nomisClientMock.getEstablishment).to.be.calledWith('ABC');
        });

        it('should return the result of the api call', () => {
            return expect(service.getEstablishmentForPrisoner('123', 'username'))
                .to.eventually.eql(establishmentResponse);
        });

        it('should throw if error in api when getting offender', () => {
            nomisClientMock.getOffenderSentences.rejects(new Error('dead'));
            return expect(service.getEstablishmentForPrisoner('123', 'username')).to.be.rejected();
        });

        it('should throw if error in api when getting establishment', () => {
            nomisClientMock.getOffenderSentences.resolves(hdcPrisonersResponse);
            nomisClientMock.getEstablishment.rejects(new Error('dead'));
            return expect(service.getEstablishmentForPrisoner('123', 'username')).to.be.rejected();
        });

        it('should NOT throw but return null if 404 in api when getting establishment', () => {
            nomisClientMock.getOffenderSentences.resolves(hdcPrisonersResponse);
            nomisClientMock.getEstablishment.rejects({status: 404});
            return expect(service.getEstablishmentForPrisoner('123', 'username')).to.eventually.eql(null);
        });

        it('should throw if error in api when getting establishment if error ststus other than 404', () => {
            nomisClientMock.getOffenderSentences.resolves(hdcPrisonersResponse);
            nomisClientMock.getEstablishment.rejects({status: 401});
            return expect(service.getEstablishmentForPrisoner('123', 'username')).to.be.rejected();
        });
    });

    describe('getComForPrisoner', () => {
        it('should call the api with the nomis id', async () => {
            nomisClientMock.getOffenderSentences.resolves(hdcPrisonersResponse);

            await service.getComForPrisoner('123', 'username');

            expect(nomisClientMock.getOffenderSentences).to.be.calledOnce();
            expect(nomisClientMock.getComRelation).to.be.calledOnce();
            expect(nomisClientMock.getOffenderSentences).to.be.calledWith('123');
            expect(nomisClientMock.getComRelation).to.be.calledWith(1);
        });

        it('should return the result of the api call', () => {

            const expectedComData = {
                com: 'Comfirst Comlast'
            };

            return expect(service.getComForPrisoner('123', 'username'))
                .to.eventually.eql(expectedComData);
        });

        it('should throw if error in api when getting offender', () => {
            nomisClientMock.getOffenderSentences.rejects(new Error('dead'));
            return expect(service.getComForPrisoner('123', 'username')).to.be.rejected();
        });

        it('should throw if error in api when getting establishment', () => {
            nomisClientMock.getOffenderSentences.resolves(hdcPrisonersResponse);
            nomisClientMock.getComRelation.rejects(new Error('dead'));
            return expect(service.getComForPrisoner('123', 'username')).to.be.rejected();
        });

        it('should NOT throw but return null if 404 in api when getting establishment', () => {
            nomisClientMock.getOffenderSentences.resolves(hdcPrisonersResponse);
            nomisClientMock.getComRelation.rejects({status: 404});
            return expect(service.getComForPrisoner('123', 'username')).to.eventually.eql(null);
        });

        it('should throw if error in api when getting establishment if error ststus other than 404', () => {
            nomisClientMock.getOffenderSentences.resolves(hdcPrisonersResponse);
            nomisClientMock.getComRelation.rejects({status: 401});
            return expect(service.getComForPrisoner('123', 'username')).to.be.rejected();
        });
    });
});
