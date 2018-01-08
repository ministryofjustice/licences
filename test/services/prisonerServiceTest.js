const createPrisonerService = require('../../server/services/prisonerService');
const {
    sandbox,
    expect
} = require('../testSetup');

describe('prisonerDetailsService', () => {

    const bookingResponse = [{
        bookingId: 1,
        facialImageId: 2,
        dateOfBirth: '1971-12-23',
        firstName: 'f',
        middleName: 'm',
        lastName: 'l',
        offenderNo: 'noms',
        aliases: 'alias',
        assignedLivingUnitDesc: 'loc'
    }];

    const bookingDetailResponse = {physicalAttributes: {gender: 'male'}};

    const imageInfoResponse = {
        imageId: 'imgId',
        captureDate: '1971-11-23'
    };

    const sentenceDetailResponse = {sentenceExpiryDate: '1985-12-03'};

    const nomisClientMock = {
        getBookings: sandbox.stub().returnsPromise().resolves(bookingResponse),
        getBooking: sandbox.stub().returnsPromise().resolves(bookingDetailResponse),
        getSentenceDetail: sandbox.stub().returnsPromise().resolves(sentenceDetailResponse),
        getImageInfo: sandbox.stub().returnsPromise().resolves(imageInfoResponse)
    };

    const nomisClientBuilder = sandbox.stub().returns(nomisClientMock);

    const prisonerInfoResponse = {
        bookingId: 1,
        facialImageId: 2,
        dateOfBirth: '23/12/1971',
        firstName: 'F',
        middleName: 'M',
        lastName: 'L',
        offenderNo: 'noms',
        aliases: 'Alias',
        assignedLivingUnitDesc: 'Loc',
        physicalAttributes: {gender: 'Male'},
        imageId: 'imgId',
        captureDate: '23/11/1971',
        sentenceExpiryDate: '03/12/1985'
    };

    const service = createPrisonerService(nomisClientBuilder);

    afterEach(() => {
        sandbox.reset();
    });

    describe('getPrisonerDetails', () => {

        it('should call the api with the nomis id', async () => {
            await service.getPrisonerDetails('123');

            expect(nomisClientMock.getBookings).to.be.calledOnce();
            expect(nomisClientMock.getBooking).to.be.calledOnce();
            expect(nomisClientMock.getSentenceDetail).to.be.calledOnce();
            expect(nomisClientMock.getImageInfo).to.be.calledOnce();

            expect(nomisClientMock.getBookings).to.be.calledWith('123');
            expect(nomisClientMock.getBooking).to.be.calledWith(1);
            expect(nomisClientMock.getSentenceDetail).to.be.calledWith(1);
            expect(nomisClientMock.getImageInfo).to.be.calledWith(2);
        });

        it('should return the result of the api call', () => {
            return expect(service.getPrisonerDetails('123'))
                .to.eventually.eql(prisonerInfoResponse);
        });

        it('should throw if error in api', () => {
            nomisClientMock.getBookings.rejects(new Error('dead'));

            return expect(service.getPrisonerDetails('123')).to.be.rejected();
        });
    });
});
