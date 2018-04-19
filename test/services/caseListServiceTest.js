const createCaseListService = require('../../server/services/caseListService');
const {
    sandbox,
    expect
} = require('../testSetup');

describe('caseListService', () => {
    const nomisClient = {
        getHdcEligiblePrisoners: sandbox.stub().returnsPromise().resolves([
            {
                bookingId: 0,
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
        getROPrisoners: sandbox.stub().returnsPromise().resolves([
            {
                offenderNo: 'A'
            },
            {
                offenderNo: 'B'
            },
            {
                offenderNo: 'C'
            }
        ])
    };

    const licenceClient = {
        getLicences: sandbox.stub().returnsPromise().resolves([]),
        getDeliusUserName: sandbox.stub().returnsPromise().resolves([{STAFF_ID: {value: 'xxx'}}])
    };

    const user = {
        staffId: '123',
        token: 'token',
        role: 'CA'
    };

    const ROUser = {
        staffId: '123',
        token: 'token',
        role: 'RO'
    };

    const nomisClientBuilder = sandbox.stub().returns(nomisClient);

    const service = createCaseListService(nomisClientBuilder, licenceClient);

    afterEach(() => {
        sandbox.reset();
    });

    describe('getHdcCaseList', () => {

        it('should format dates', async () => {
            const result = await service.getHdcCaseList(user);

            expect(result[0].sentenceDetail.homeDetentionCurfewEligibilityDate).to.eql('07/09/2017');
            expect(result[0].sentenceDetail.conditionalReleaseDate).to.eql('15/12/2017');
        });

        it('should capitalise names', async () => {
            const result = await service.getHdcCaseList(user);

            expect(result[0].firstName).to.eql('Mark');
            expect(result[0].lastName).to.eql('Andrews');
        });

        it('should add a status to the prisoners', async () => {
            const result = await service.getHdcCaseList(user);

            expect(result[0].status).to.eql('Not started');
        });

        it('should add a processing stage to the prisoners', async () => {
            const result = await service.getHdcCaseList(user);

            expect(result[0].stage).to.eql('UNSTARTED');
        });

        it('should return empty array if no results', () => {
            nomisClient.getHdcEligiblePrisoners.resolves([]);

            return expect(service.getHdcCaseList(user)).to.eventually.eql([]);
        });

        it('should return empty array if no null returned', () => {
            nomisClient.getHdcEligiblePrisoners.resolves(null);

            return expect(service.getHdcCaseList(user)).to.eventually.eql([]);
        });

        context('when user is a CA', () => {
            it('should call getHdcEligiblePrisoners from nomisClient', () => {
                service.getHdcCaseList(user);

                expect(nomisClient.getHdcEligiblePrisoners).to.be.calledOnce();
                expect(nomisClient.getHdcEligiblePrisoners.firstCall.args.length).to.eql(0);
            });
        });

        context('when user is a RO', () => {
            it('should call getROPrisoners && getHdcEligiblePrisoners from nomisClient', async () => {
                await service.getHdcCaseList(ROUser);

                expect(nomisClient.getROPrisoners).to.be.calledOnce();
                expect(nomisClient.getHdcEligiblePrisoners).to.be.calledOnce();
                expect(nomisClient.getHdcEligiblePrisoners).to.be.calledWith(['A', 'B', 'C']);
            });

            it('should not call getHdcEligiblePrisoners when no results from getROPrisoners', async () => {

                nomisClient.getROPrisoners.resolves([]);

                await service.getHdcCaseList(ROUser);

                expect(nomisClient.getROPrisoners).to.be.calledOnce();
            });

            it('should return empty array if no delius user name found', async () => {
                licenceClient.getDeliusUserName.resolves({});

                const result = await service.getHdcCaseList(ROUser);

                expect(result).to.eql([]);
                expect(nomisClient.getHdcEligiblePrisoners).not.to.be.calledOnce();
            });
        });

        describe('sorting', () => {

            const offender1 = {
                name: 'offender1',
                sentenceDetail: {
                    homeDetentionCurfewEligibilityDate: '2017-09-07',
                    conditionalReleaseDate: '2017-12-15'
                }
            };
            const offender2 = {
                name: 'offender2',
                sentenceDetail: {
                    homeDetentionCurfewEligibilityDate: '2017-10-07',
                    conditionalReleaseDate: '2017-12-15'
                }
            };
            const offender3 = {
                name: 'offender3',
                sentenceDetail: {
                    homeDetentionCurfewEligibilityDate: '2017-11-07',
                    conditionalReleaseDate: '2017-12-11'
                }
            };

            const offender4 = {
                name: 'offender4',
                sentenceDetail: {
                    homeDetentionCurfewEligibilityDate: '2017-11-07',
                    conditionalReleaseDate: '2017-12-12'
                }
            };

            const offender5 = {
                name: 'offender5',
                sentenceDetail: {
                    homeDetentionCurfewEligibilityDate: '2017-11-07',
                    conditionalReleaseDate: '2017-12-13'
                }
            };


            it('should order by homeDetentionCurfewEligibilityDate first', async() => {

                nomisClient.getHdcEligiblePrisoners.resolves([
                    offender3,
                    offender1,
                    offender2
                ]);

                const result = await service.getHdcCaseList(user);

                expect(result[0].name).to.eql('offender1');
                expect(result[1].name).to.eql('offender2');
                expect(result[2].name).to.eql('offender3');
            });

            it('should order by conditionalReleaseDate second', async() => {

                nomisClient.getHdcEligiblePrisoners.resolves([
                    offender5,
                    offender4,
                    offender3
                ]);

                const result = await service.getHdcCaseList(user);

                expect(result[0].name).to.eql('offender3');
                expect(result[1].name).to.eql('offender4');
                expect(result[2].name).to.eql('offender5');
            });

            it('should order by automaticReleaseDate second if no conditionalReleaseDate is present', async() => {

                const offender6 = {
                    name: 'offender6',
                    sentenceDetail: {
                        homeDetentionCurfewEligibilityDate: '2017-11-07',
                        conditionalReleaseDate: '',
                        automaticReleaseDate: '2017-12-13'
                    }
                };

                nomisClient.getHdcEligiblePrisoners.resolves([
                    offender6,
                    offender4,
                    offender3
                ]);

                const result = await service.getHdcCaseList(user);

                expect(result[0].name).to.eql('offender3');
                expect(result[1].name).to.eql('offender4');
                expect(result[2].name).to.eql('offender6');
            });
        });
    });
});
