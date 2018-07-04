const nock = require('nock');

const createSearchService = require('../../server/services/searchService');
const createCaseListFormatter = require('../../server/services/utils/caseListFormatter');

describe('searchService', () => {
    let nomisClient;
    let service;

    beforeEach(() => {
        nomisClient = {
            getOffenderSentences: sinon.stub().resolves([
                {
                    bookingId: 123456,
                    offenderNo: 'A12345',
                    firstName: 'MARK',
                    middleNames: '',
                    lastName: 'ANDREWS',
                    agencyLocationDesc: 'BERWIN (HMP)',
                    internalLocationDesc: 'A-C-2-002',
                    sentenceDetail: {
                        homeDetentionCurfewEligibilityDate: '2017-09-07',
                        conditionalReleaseDate: '2017-12-15',
                        receptionDate: '2018-01-03'
                    }
                }
            ]),
            getPrisoners: sinon.stub().resolves([{offenderNo: 'A0001AA'}, {offenderNo: 'A0001BB'}]),
            getComRelation: sinon.stub().resolves({comName: 'COMNAME'})
        };

        const licenceClient = {
            getLicences: sinon.stub().resolves([]),
            getDeliusUserName: sinon.stub().resolves([{STAFF_ID: {value: 'xxx'}}])
        };

        const logger = {
            info: sinon.stub(),
            error: sinon.stub()
        };

        const nomisClientBuilder = sinon.stub().returns(nomisClient);
        const caseListFormatter = createCaseListFormatter(logger, licenceClient);

        service = createSearchService(logger, nomisClientBuilder, caseListFormatter);
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe('searchOffenders', () => {
        it('should get prisoners and add com relation', async () => {

            const result = await service.searchOffenders('A0001AA', {});

            expect(nomisClient.getOffenderSentences).to.be.calledOnce();
            expect(nomisClient.getOffenderSentences).to.be.calledWith(['A0001AA']);

            expect(nomisClient.getComRelation).to.be.calledOnce();
            expect(nomisClient.getComRelation).to.be.calledWith(123456);

            expect(result[0].com).to.eql({comName: 'COMNAME'});
        });

        it('should remove duplicate nomis IDs before searching nomis', async () => {
            await service.searchOffenders(['A0001AA', 'A0001AA', 'A0002AA'], {});

            expect(nomisClient.getOffenderSentences).to.be.calledOnce();
            expect(nomisClient.getOffenderSentences).to.be.calledWith(['A0001AA', 'A0002AA']);
        });

        it('should not search nomis if no nomis iDs', async () => {

            await service.searchOffenders(['', '   '], {});

            expect(nomisClient.getOffenderSentences).to.not.be.calledOnce();
        });
    });

});
