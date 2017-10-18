const createPrisonerDetailsService = require('../../server/services/prisonerDetailsService');
const {
    sandbox,
    expect
} = require('../testSetup');

describe('prisonerDetailsService', () => {

    const bookingResponse = [{
        bookingId: 1,
        facialImageId: 2,
        dateOfBirth: 'dob',
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
        captureDate: 'imgDate'
    };

    const sentenceDetailResponse = {date: '123'};

    const nomisClientMock = {
        getBookings: sandbox.stub().returnsPromise().resolves(bookingResponse),
        getBooking: sandbox.stub().returnsPromise().resolves(bookingDetailResponse),
        getSentenceDetail: sandbox.stub().returnsPromise().resolves(sentenceDetailResponse),
        getImageInfo: sandbox.stub().returnsPromise().resolves(imageInfoResponse)
    };

    const nomisClientBuilder = sandbox.stub().returns(nomisClientMock);

    const prisonerInfoResponse =
        {...bookingDetailResponse, ...bookingResponse[0], ...imageInfoResponse, ...sentenceDetailResponse};

    const service = createPrisonerDetailsService(nomisClientBuilder);

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
