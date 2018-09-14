const createCaseListService = require('../../server/services/caseListService');
const createCaseListFormatter = require('../../server/services/utils/caseListFormatter');
const caseList = require('../stubs/caseListResponse');
const {logger} = require('../supertestSetup');

describe('caseListService', () => {
    let nomisClient;
    let service;
    let licenceClient;

    const roPrisoners = [
        {bookingId: 'A'},
        {bookingId: 'B'},
        {bookingId: 'C'}
    ];
    const hdcEligiblePrisoners = [
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
                effectiveConditionalReleaseDate: '2017-12-16',
                receptionDate: '2018-01-03'
            }
        }
    ];
    const user = {
        username: '123',
        token: 'token',
        role: 'CA'
    };
    const ROUser = {
        username: '123',
        token: 'token',
        role: 'RO'
    };

    beforeEach(() => {
        nomisClient = {
            getHdcEligiblePrisoners: sinon.stub(),
            getOffenderSentencesByBookingId: sinon.stub().resolves([
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
                        effectiveConditionalReleaseDate: '2017-12-15',
                        receptionDate: '2018-01-03'
                    }
                }
            ]),
            getROPrisoners: sinon.stub()
        };

        licenceClient = {
            getLicences: sinon.stub().resolves([]),
            getDeliusUserName: sinon.stub().returns('foo-username')
        };

        const nomisClientBuilder = sinon.stub().returns(nomisClient);
        const caseListFormatter = createCaseListFormatter(logger, licenceClient);

        service = createCaseListService(nomisClientBuilder, licenceClient, caseListFormatter);
    });


    describe('getHdcCaseList', () => {
        it('should format dates', async () => {
            nomisClient.getHdcEligiblePrisoners.returns(hdcEligiblePrisoners);

            const result = await service.getHdcCaseList(user.token, user.username, user.role);

            expect(result[0].sentenceDetail.homeDetentionCurfewEligibilityDate).to.eql('07/09/2017');
            expect(result[0].sentenceDetail.effectiveConditionalReleaseDate).to.eql('16/12/2017');
        });

        it('should capitalise names', async () => {
            nomisClient.getHdcEligiblePrisoners.returns(hdcEligiblePrisoners);

            const result = await service.getHdcCaseList(user.token, user.username, user.role);

            expect(result[0].firstName).to.eql('Mark');
            expect(result[0].lastName).to.eql('Andrews');
        });

        it('should add a status to the prisoners', async () => {
            nomisClient.getHdcEligiblePrisoners.returns(hdcEligiblePrisoners);

            const result = await service.getHdcCaseList(user.token, user.username, user.role);

            expect(result[0].status).to.eql('Not started');
        });

        it('should add a processing stage to the prisoners', async () => {
            nomisClient.getHdcEligiblePrisoners.returns(hdcEligiblePrisoners);

            const result = await service.getHdcCaseList(user.token, user.username, user.role);

            expect(result[0].stage).to.eql('UNSTARTED');
        });

        it('should return empty array if no results', () => {
            nomisClient.getHdcEligiblePrisoners.resolves([]);

            return expect(service.getHdcCaseList(user.token, user.username, user.role)).to.eventually.eql([]);
        });

        it('should return empty array if no null returned', () => {
            nomisClient.getHdcEligiblePrisoners.resolves(null);

            return expect(service.getHdcCaseList(user.token, user.username, user.role)).to.eventually.eql([]);
        });

        context('when user is a CA', () => {
            it('should call getHdcEligiblePrisoners from nomisClient', () => {
                service.getHdcCaseList(user.token, user.username, user.role);

                expect(nomisClient.getHdcEligiblePrisoners).to.be.calledOnce();
                expect(nomisClient.getHdcEligiblePrisoners.firstCall.args.length).to.eql(0);
            });

            describe('adding the hdced countdown', () => {

                let clock;

                beforeEach(() => {
                    clock = sinon.useFakeTimers(new Date('May 31, 2018 00:00:00').getTime());
                });

                afterEach(() => {
                    clock.restore();
                });

                it('should add the number of days until hdced', async () => {

                    nomisClient.getHdcEligiblePrisoners.returns([{
                        ...hdcEligiblePrisoners[0],
                        sentenceDetail: {
                            ...hdcEligiblePrisoners[0].sentenceDetail,
                            homeDetentionCurfewEligibilityDate: '2018-06-01'
                        }
                    }]);

                    const result = await service.getHdcCaseList(user.token, user.username, user.role);
                    expect(result[0].due).to.eql({text: '1 day', overdue: false});
                });

                it('should show 0 days if it is today', async () => {

                    nomisClient.getHdcEligiblePrisoners.returns([{
                        ...hdcEligiblePrisoners[0],
                        sentenceDetail: {
                            ...hdcEligiblePrisoners[0].sentenceDetail,
                            homeDetentionCurfewEligibilityDate: '2018-05-31'
                        }
                    }]);

                    const result = await service.getHdcCaseList(user.token, user.username, user.role);
                    expect(result[0].due).to.eql({text: '0 days', overdue: false});
                });

                it('should set overdue if in the past', async () => {

                    nomisClient.getHdcEligiblePrisoners.returns([{
                        ...hdcEligiblePrisoners[0],
                        sentenceDetail: {
                            ...hdcEligiblePrisoners[0].sentenceDetail,
                            homeDetentionCurfewEligibilityDate: '2018-05-30'
                        }
                    }]);

                    const result = await service.getHdcCaseList(user.token, user.username, user.role);
                    expect(result[0].due).to.eql({text: '1 day overdue', overdue: true});
                });

                it('should add in months if longer than 3 months', async () => {

                    nomisClient.getHdcEligiblePrisoners.returns([{
                        ...hdcEligiblePrisoners[0],
                        sentenceDetail: {
                            ...hdcEligiblePrisoners[0].sentenceDetail,
                            homeDetentionCurfewEligibilityDate: '2018-12-01'
                        }
                    }]);

                    const result = await service.getHdcCaseList(user.token, user.username, user.role);
                    expect(result[0].due).to.eql({text: '6 months', overdue: false});
                });

                it('should add in years if longer than 1 year', async () => {

                    nomisClient.getHdcEligiblePrisoners.returns([{
                        ...hdcEligiblePrisoners[0],
                        sentenceDetail: {
                            ...hdcEligiblePrisoners[0].sentenceDetail,
                            homeDetentionCurfewEligibilityDate: '2020-07-01'
                        }
                    }]);

                    const result = await service.getHdcCaseList(user.token, user.username, user.role);
                    expect(result[0].due).to.eql({text: '2 years', overdue: false});
                });

            });
        });

        context('when user is a RO', () => {
            it('should call getROPrisoners && getOffenderSentencesByBookingId from nomisClient', async () => {
                nomisClient.getROPrisoners.resolves(roPrisoners);

                await service.getHdcCaseList(ROUser.token, ROUser.username, ROUser.role);

                expect(nomisClient.getROPrisoners).to.be.calledOnce();
                expect(nomisClient.getOffenderSentencesByBookingId).to.be.calledOnce();
                expect(nomisClient.getOffenderSentencesByBookingId).to.be.calledWith(['A', 'B', 'C']);
            });

            it('should not call getOffenderSentencesByBookingId when no results from getROPrisoners', async () => {

                nomisClient.getROPrisoners.resolves([]);

                await service.getHdcCaseList(ROUser.token, ROUser.username, ROUser.role);

                expect(nomisClient.getROPrisoners).to.be.calledOnce();
                expect(nomisClient.getOffenderSentencesByBookingId).not.to.be.calledOnce();
            });

            it('should return empty array if no delius user name found', async () => {
                licenceClient.getDeliusUserName.resolves(undefined);

                const result = await service.getHdcCaseList(ROUser.token, ROUser.username, ROUser.role);

                expect(result).to.eql([]);
                expect(nomisClient.getROPrisoners).not.to.be.calledOnce();
                expect(nomisClient.getHdcEligiblePrisoners).not.to.be.calledOnce();
            });

            describe('days since case received', () => {

                let clock;
                const offender1 = {
                    name: 'offender1',
                    bookingId: 'a',
                    sentenceDetail: {
                        homeDetentionCurfewEligibilityDate: '2017-09-14',
                        conditionalReleaseDate: '2017-12-15',
                        releaseDate: '2017-12-15'
                    }
                };
                const offender2 = {
                    name: 'offender2',
                    bookingId: 'b',
                    sentenceDetail: {
                        homeDetentionCurfewEligibilityDate: '2017-10-07',
                        conditionalReleaseDate: '2017-12-15',
                        releaseDate: '2017-12-15'
                    }
                };

                beforeEach(() => {
                    clock = sinon.useFakeTimers(new Date('May 31, 2018 00:00:00').getTime());
                });

                afterEach(() => {
                    clock.restore();
                });

                it('should add Today to those received today', async () => {
                    nomisClient.getROPrisoners.resolves(['a']);
                    nomisClient.getOffenderSentencesByBookingId.resolves([offender1]);
                    licenceClient.getLicences.resolves([
                        {booking_id: 'a', transition_date: '2018-05-31 15:23:39.530927', stage: 'PROCESSING_RO'}
                    ]);

                    const result = await service.getHdcCaseList(user.token, user.username, 'RO');
                    expect(result[0].received).to.eql({text: 'Today', days: '0'});
                });

                it('should add the number of days until hdced', async () => {
                    nomisClient.getROPrisoners.resolves(['a']);
                    nomisClient.getOffenderSentencesByBookingId.resolves([offender1]);
                    licenceClient.getLicences.resolves([
                        {booking_id: 'a', transition_date: '2018-05-16 15:23:39.530927', stage: 'PROCESSING_RO'}
                    ]);

                    const result = await service.getHdcCaseList(user.token, user.username, 'RO');
                    expect(result[0].received).to.eql({text: '14 days ago', days: '14'});
                });

                it('should not add the number of days if not in PROCESSING_RO', async () => {
                    nomisClient.getROPrisoners.resolves(['a']);
                    nomisClient.getOffenderSentencesByBookingId.resolves([offender1]);
                    licenceClient.getLicences.resolves([
                        {booking_id: 'a', transition_date: '2018-05-16 15:23:39.530927', stage: 'MODIFIED'}
                    ]);

                    const result = await service.getHdcCaseList(user.token, user.username, 'RO');
                    expect(result[0].received).to.be.undefined();
                });

                it('should order on days since received first', async () => {
                    nomisClient.getROPrisoners.resolves(['a']);
                    nomisClient.getOffenderSentencesByBookingId.resolves([offender1, offender2]);
                    licenceClient.getLicences.resolves([
                        {booking_id: 'a', transition_date: '2018-05-20 15:23:39.530927', stage: 'PROCESSING_RO'},
                        {booking_id: 'b', transition_date: '2018-05-18 15:23:39.530927', stage: 'PROCESSING_RO'}
                    ]);

                    const result = await service.getHdcCaseList(user.token, user.username, 'RO');
                    expect(result[0].bookingId).to.eql('b');
                    expect(result[1].bookingId).to.eql('a');
                });

                it('should order on days since received first', async () => {
                    nomisClient.getROPrisoners.resolves(['a']);
                    nomisClient.getOffenderSentencesByBookingId.resolves([offender1, offender2]);
                    licenceClient.getLicences.resolves([
                        {booking_id: 'a', transition_date: '2018-05-17 15:23:39.530927', stage: 'PROCESSING_RO'},
                        {booking_id: 'b', transition_date: '2018-05-18 15:23:39.530927', stage: 'PROCESSING_RO'}
                    ]);

                    const result = await service.getHdcCaseList(user.token, user.username, 'RO');
                    expect(result[0].bookingId).to.eql('a');
                    expect(result[1].bookingId).to.eql('b');
                });

                it('should prioritise those with received date', async () => {
                    nomisClient.getROPrisoners.resolves(['a']);
                    nomisClient.getOffenderSentencesByBookingId.resolves([offender1, offender2]);
                    licenceClient.getLicences.resolves([
                        {booking_id: 'a', transition_date: '2018-05-17 15:23:39.530927', stage: 'MODIFIED'},
                        {booking_id: 'b', transition_date: '2018-05-18 15:23:39.530927', stage: 'PROCESSING_RO'}
                    ]);

                    const result = await service.getHdcCaseList(user.token, user.username, 'RO');
                    expect(result[0].bookingId).to.eql('b');
                    expect(result[1].bookingId).to.eql('a');
                });

                it('should sort by release date if neither have received date', async () => {
                    nomisClient.getROPrisoners.resolves(['a']);
                    nomisClient.getOffenderSentencesByBookingId.resolves([offender2, offender1]);
                    licenceClient.getLicences.resolves([
                        {booking_id: 'a', transition_date: '2018-05-17 15:23:39.530927', stage: 'MODIFIED'},
                        {booking_id: 'b', transition_date: '2018-05-18 15:23:39.530927', stage: 'MODIFIED'}
                    ]);

                    const result = await service.getHdcCaseList(user.token, user.username, 'RO');
                    expect(result[0].bookingId).to.eql('a');
                    expect(result[1].bookingId).to.eql('b');
                });
            });
        });

        describe('sorting', () => {
            const offender1 = {
                name: 'offender1',
                sentenceDetail: {
                    homeDetentionCurfewEligibilityDate: '2017-09-14',
                    conditionalReleaseDate: '2017-12-15',
                    releaseDate: '2017-12-15'
                }
            };
            const offender2 = {
                name: 'offender2',
                sentenceDetail: {
                    homeDetentionCurfewEligibilityDate: '2017-10-07',
                    conditionalReleaseDate: '2017-12-15',
                    releaseDate: '2017-12-15'
                }
            };
            const offender3 = {
                name: 'offender3',
                sentenceDetail: {
                    homeDetentionCurfewEligibilityDate: '2017-11-06',
                    conditionalReleaseDate: '2017-01-13',
                    releaseDate: '2017-01-13'
                }
            };

            const offender4 = {
                name: 'offender4',
                sentenceDetail: {
                    homeDetentionCurfewEligibilityDate: '2017-11-07',
                    conditionalReleaseDate: '2017-07-22',
                    releaseDate: '2017-07-22'
                }
            };

            const offender5 = {
                name: 'offender5',
                sentenceDetail: {
                    homeDetentionCurfewEligibilityDate: '2017-11-07',
                    conditionalReleaseDate: '2017-12-13',
                    releaseDate: '2017-12-13'
                }
            };

            it('should order by homeDetentionCurfewEligibilityDate first', async () => {
                nomisClient.getHdcEligiblePrisoners.resolves([
                    offender3,
                    offender1,
                    offender2
                ]);

                const result = await service.getHdcCaseList(user.token, user.username, user.role);

                expect(result[0].name).to.eql('offender1');
                expect(result[1].name).to.eql('offender2');
                expect(result[2].name).to.eql('offender3');
            });

            it('should order by releaseDate second', async () => {
                nomisClient.getHdcEligiblePrisoners.resolves([
                    offender5,
                    offender4,
                    offender3
                ]);

                const result = await service.getHdcCaseList(user.token, user.username, user.role);

                expect(result[0].name).to.eql('offender3');
                expect(result[1].name).to.eql('offender4');
                expect(result[2].name).to.eql('offender5');
            });
        });
    });

    describe('addTabToCase', () => {
        context('user is CA', () => {

            const caselist = [
                {
                    // UNSTARTED
                    offender: null,
                    context: [
                        {role: 'CA', tab: 'ready'},
                        {role: 'RO', tab: 'ready'},
                        {role: 'DM', tab: 'ready'}
                    ]
                },
                {
                    // PROCESSING_RO
                    offender: caseList[0],
                    context: [
                        {role: 'CA', tab: 'submittedRo'},
                        {role: 'RO', tab: null},
                        {role: 'DM', tab: null}
                    ]
                },
                {
                    // UNSTARTED
                    offender: caseList[1],
                    context: [
                        {role: 'CA', tab: 'ready'},
                        {role: 'RO', tab: null},
                        {role: 'DM', tab: null}
                    ]
                },
                {
                    // ELIGIBILITY
                    offender: caseList[2],
                    context: [
                        {role: 'CA', tab: 'ready'},
                        {role: 'RO', tab: null},
                        {role: 'DM', tab: null}
                    ]
                },
                {
                    // APPROVAL
                    offender: caseList[3],
                    context: [
                        {role: 'CA', tab: 'submittedDm'},
                        {role: 'RO', tab: 'withPrison'},
                        {role: 'DM', tab: 'ready'}
                    ]
                },
                {
                    // DECIDED
                    offender: caseList[4],
                    context: [
                        {role: 'CA', tab: 'create'},
                        {role: 'RO', tab: 'approved'},
                        {role: 'DM', tab: 'approved'}
                    ]
                },
                {
                    // DECIDED, refused
                    offender: caseList[5],
                    context: [
                        {role: 'CA', tab: null},
                        {role: 'RO', tab: null},
                        {role: 'DM', tab: 'refused'}
                    ]
                },
                {
                    // PROCESSING_CA
                    offender: caseList[6],
                    context: [
                        {role: 'CA', tab: 'reviewCase'},
                        {role: 'RO', tab: 'withPrison'},
                        {role: 'DM', tab: null}
                    ]
                },
                {
                    // PROCESSING_CA, postponed
                    offender: caseList[7],
                    context: [
                        {role: 'CA', tab: 'reviewCase'},
                        {role: 'RO', tab: 'withPrison'},
                        {role: 'DM', tab: 'postponed'}
                    ]
                },
                {
                    // ELIGIBILITY, opted out
                    offender: caseList[8],
                    context: [
                        {role: 'CA', tab: 'getAddress'},
                        {role: 'RO', tab: null},
                        {role: 'DM', tab: null}
                    ]
                },
                {
                    // ELIGIBILITY, eligible
                    offender: caseList[9],
                    context: [
                        {role: 'CA', tab: 'getAddress'},
                        {role: 'RO', tab: null},
                        {role: 'DM', tab: null}
                    ]
                },
                {
                    // PROCESSING_RO
                    offender: caseList[10],
                    context: [
                        {role: 'CA', tab: 'submittedRo'},
                        {role: 'RO', tab: 'ready'},
                        {role: 'DM', tab: null}
                    ]
                },
                {
                    // ELIGIBILITY, getting address
                    offender: caseList[11],
                    context: [
                        {role: 'CA', tab: 'ready'},
                        {role: 'RO', tab: null},
                        {role: 'DM', tab: null}
                    ]
                },
                {
                    // ELIGIBILITY, address rejected
                    offender: caseList[12],
                    context: [
                        {role: 'CA', tab: 'getAddress'},
                        {role: 'RO', tab: null},
                        {role: 'DM', tab: null}
                    ]
                }
            ];

            caselist.forEach(licence => {
                licence.context.forEach(roleContext => {
                    it('should add tab to case', () => {
                        const res = service.addTabToCase(roleContext.role, licence.offender);

                        expect(res.tab).to.eql(roleContext.tab);
                    });
                });
            });
        });
    });

    describe('addTabToCases', () => {
        it('should add tab to all cases in the caselist', () => {
            const res = service.addTabToCases('CA', caseList);

            expect(res[0].tab).to.eql('submittedRo');
            expect(res[1].tab).to.eql('ready');
            expect(res[2].tab).to.eql('ready');
            expect(res[3].tab).to.eql('submittedDm');
            expect(res[4].tab).to.eql('create');
            expect(res[5].tab).to.eql(null);
            expect(res[6].tab).to.eql('reviewCase');
            expect(res[7].tab).to.eql('reviewCase');
            expect(res[8].tab).to.eql('getAddress');
            expect(res[9].tab).to.eql('getAddress');
            expect(res[10].tab).to.eql('submittedRo');
            expect(res[11].tab).to.eql('ready');
            expect(res[12].tab).to.eql('getAddress');
        });
    });
});
