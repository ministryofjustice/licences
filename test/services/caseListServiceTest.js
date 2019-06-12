const createCaseListService = require('../../server/services/caseListService')
const createCaseListFormatter = require('../../server/services/utils/caseListFormatter')
const { logger } = require('../supertestSetup')

describe('caseListService', () => {
  let nomisClient
  let service
  let licenceClient
  let roService

  const roPrisoners = [{ bookingId: 'A' }, { bookingId: 'B' }, { bookingId: 'C' }]
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
        receptionDate: '2018-01-03',
      },
    },
  ]

  const formattedPrisoners = [
    {
      bookingId: 0,
      offenderNo: 'A12345',
      firstName: 'Mark',
      middleNames: '',
      lastName: 'Andrews',
      agencyLocationDesc: 'HMP Berwin',
      internalLocationDesc: 'A-C-2-002',
      sentenceDetail: {
        homeDetentionCurfewEligibilityDate: '07/09/2017',
        conditionalReleaseDate: '2017-12-15',
        effectiveConditionalReleaseDate: '16/12/2017',
        receptionDate: '2018-01-03',
      },
      stage: 'UNSTARTED',
      status: 'Not started',
      activeCase: true,
      due: {
        overdue: true,
        text: '266 days overdue',
      },
    },
  ]

  const noEligibleCasesResponse = {
    hdcEligible: [],
    message: 'No HDC cases',
  }

  const user = {
    username: '123',
    token: 'token',
    role: 'CA',
  }
  const ROUser = {
    username: '123',
    token: 'token',
    role: 'RO',
  }

  beforeEach(() => {
    nomisClient = {
      getHdcEligiblePrisoners: sinon.stub(),
    }

    roService = {
      getROPrisoners: sinon.stub().resolves([
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
            receptionDate: '2018-01-03',
          },
        },
      ]),
    }

    licenceClient = {
      getLicences: sinon.stub().resolves([]),
      getDeliusUserName: sinon.stub().returns([{ staff_id: 'foo-username' }]),
    }

    const nomisClientBuilder = sinon.stub().returns(nomisClient)
    const caseListFormatter = createCaseListFormatter(logger, licenceClient)

    service = createCaseListService(nomisClientBuilder, roService, licenceClient, caseListFormatter)
  })

  describe('getHdcCaseList', () => {
    it('should format dates', async () => {
      nomisClient.getHdcEligiblePrisoners.returns(hdcEligiblePrisoners)

      const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)

      expect(hdcEligible[0].sentenceDetail.homeDetentionCurfewEligibilityDate).to.eql('07/09/2017')
      expect(hdcEligible[0].sentenceDetail.effectiveConditionalReleaseDate).to.eql('16/12/2017')
    })

    it('should capitalise names', async () => {
      nomisClient.getHdcEligiblePrisoners.returns(hdcEligiblePrisoners)
      const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
      expect(hdcEligible[0].firstName).to.eql('Mark')
      expect(hdcEligible[0].lastName).to.eql('Andrews')
    })

    it('should add a status to the prisoners', async () => {
      nomisClient.getHdcEligiblePrisoners.returns(hdcEligiblePrisoners)
      const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
      expect(hdcEligible[0].status).to.eql('Not started')
    })

    it('should add a processing stage to the prisoners', async () => {
      nomisClient.getHdcEligiblePrisoners.returns(hdcEligiblePrisoners)
      const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
      expect(hdcEligible[0].stage).to.eql('UNSTARTED')
    })

    it('should return empty array and message if no results', () => {
      nomisClient.getHdcEligiblePrisoners.resolves([])
      return expect(service.getHdcCaseList(user.token, user.username, user.role)).to.eventually.eql(
        noEligibleCasesResponse
      )
    })

    it('should return empty array if null returned', () => {
      nomisClient.getHdcEligiblePrisoners.resolves(null)
      return expect(service.getHdcCaseList(user.token, user.username, user.role)).to.eventually.eql(
        noEligibleCasesResponse
      )
    })

    context('when user is a CA', () => {
      let clock

      beforeEach(() => {
        clock = sinon.useFakeTimers(new Date('May 31, 2018 00:00:00').getTime())
      })

      afterEach(() => {
        clock.restore()
      })

      it('should call getHdcEligiblePrisoners from nomisClient', () => {
        service.getHdcCaseList(user.token, user.username, user.role)
        expect(nomisClient.getHdcEligiblePrisoners).to.be.calledOnce()
        expect(nomisClient.getHdcEligiblePrisoners.firstCall.args.length).to.eql(0)
      })

      it('should return eligible prisoners', async () => {
        nomisClient.getHdcEligiblePrisoners.returns(hdcEligiblePrisoners)
        const result = await service.getHdcCaseList(user.token, user.username, user.role)
        expect(result.hdcEligible).to.eql(formattedPrisoners)
      })

      it('should return message when no eligible prisoners', async () => {
        nomisClient.getHdcEligiblePrisoners.returns([])
        const result = await service.getHdcCaseList(user.token, user.username, user.role)
        expect(result).to.eql({ hdcEligible: [], message: 'No HDC cases' })
      })

      describe('adding the hdced countdown', () => {
        it('should add the number of days until hdced', async () => {
          nomisClient.getHdcEligiblePrisoners.returns([
            {
              ...hdcEligiblePrisoners[0],
              sentenceDetail: {
                ...hdcEligiblePrisoners[0].sentenceDetail,
                homeDetentionCurfewEligibilityDate: '2018-06-01',
              },
            },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
          expect(hdcEligible[0].due).to.eql({ text: '1 day', overdue: false })
        })

        it('should show 0 days if it is today', async () => {
          nomisClient.getHdcEligiblePrisoners.returns([
            {
              ...hdcEligiblePrisoners[0],
              sentenceDetail: {
                ...hdcEligiblePrisoners[0].sentenceDetail,
                homeDetentionCurfewEligibilityDate: '2018-05-31',
              },
            },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
          expect(hdcEligible[0].due).to.eql({ text: '0 days', overdue: false })
        })

        it('should set overdue if in the past', async () => {
          nomisClient.getHdcEligiblePrisoners.returns([
            {
              ...hdcEligiblePrisoners[0],
              sentenceDetail: {
                ...hdcEligiblePrisoners[0].sentenceDetail,
                homeDetentionCurfewEligibilityDate: '2018-05-30',
              },
            },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
          expect(hdcEligible[0].due).to.eql({ text: '1 day overdue', overdue: true })
        })

        it('should add in weeks if longer than 14 days', async () => {
          nomisClient.getHdcEligiblePrisoners.returns([
            {
              ...hdcEligiblePrisoners[0],
              sentenceDetail: {
                ...hdcEligiblePrisoners[0].sentenceDetail,
                homeDetentionCurfewEligibilityDate: '2018-06-14',
              },
            },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
          expect(hdcEligible[0].due).to.eql({ text: '2 weeks', overdue: false })
        })

        it('should add in days if less than 14 days', async () => {
          nomisClient.getHdcEligiblePrisoners.returns([
            {
              ...hdcEligiblePrisoners[0],
              sentenceDetail: {
                ...hdcEligiblePrisoners[0].sentenceDetail,
                homeDetentionCurfewEligibilityDate: '2018-06-13',
              },
            },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
          expect(hdcEligible[0].due).to.eql({ text: '13 days', overdue: false })
        })

        it('should add in months if longer than 12 weeks', async () => {
          nomisClient.getHdcEligiblePrisoners.returns([
            {
              ...hdcEligiblePrisoners[0],
              sentenceDetail: {
                ...hdcEligiblePrisoners[0].sentenceDetail,
                homeDetentionCurfewEligibilityDate: '2019-01-19',
              },
            },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
          expect(hdcEligible[0].due).to.eql({ text: '7 months', overdue: false })
        })

        it('should add in years if longer than 18 months', async () => {
          nomisClient.getHdcEligiblePrisoners.returns([
            {
              ...hdcEligiblePrisoners[0],
              sentenceDetail: {
                ...hdcEligiblePrisoners[0].sentenceDetail,
                homeDetentionCurfewEligibilityDate: '2020-07-01',
              },
            },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
          expect(hdcEligible[0].due).to.eql({ text: '2 years', overdue: false })
        })
      })
    })

    context('when user is a RO', () => {
      it('should call getROPrisoners', async () => {
        roService.getROPrisoners.resolves(roPrisoners)
        await service.getHdcCaseList(ROUser.token, ROUser.username, ROUser.role)
        expect(roService.getROPrisoners).to.be.calledOnce()
      })

      it('should call getDeliusUserName without capitalising username', async () => {
        licenceClient.getDeliusUserName.resolves(undefined)
        await service.getHdcCaseList(ROUser.token, 'aAaA', ROUser.role)
        expect(licenceClient.getDeliusUserName).to.be.calledWith('aAaA')
      })

      it('should use uppercase delius username when calling roService', async () => {
        licenceClient.getDeliusUserName.resolves([{ staff_id: 'delius_id' }])
        await service.getHdcCaseList(ROUser.token, 'user', ROUser.role)
        expect(roService.getROPrisoners).to.be.calledOnce()
        expect(roService.getROPrisoners).to.be.calledWith('DELIUS_ID')
      })

      it('should return empty array and explanation message if no eligible releases found', async () => {
        roService.getROPrisoners.resolves([])
        const result = await service.getHdcCaseList(ROUser.token, ROUser.username, ROUser.role)
        expect(result).to.eql({ hdcEligible: [], message: 'No HDC cases' })
      })

      it('should return empty array and explanation message if no delius user name found', async () => {
        licenceClient.getDeliusUserName.resolves(undefined)
        const result = await service.getHdcCaseList(ROUser.token, ROUser.username, ROUser.role)
        expect(result).to.eql({ hdcEligible: [], message: 'Delius username not found for current user' })
      })

      it('should return empty array and explanation message if too many delius user names found', async () => {
        licenceClient.getDeliusUserName.resolves([{ staff_id: '1' }, { staff_id: '2' }])
        const result = await service.getHdcCaseList(ROUser.token, ROUser.username, ROUser.role)
        expect(result).to.eql({ hdcEligible: [], message: 'Multiple Delius usernames found for current user' })
      })

      describe('days since case received', () => {
        let clock
        const offender1 = {
          name: 'offender1',
          bookingId: 'a',
          sentenceDetail: {
            homeDetentionCurfewEligibilityDate: '2017-09-14',
            conditionalReleaseDate: '2017-12-15',
            releaseDate: '2017-12-15',
          },
        }
        const offender2 = {
          name: 'offender2',
          bookingId: 'b',
          sentenceDetail: {
            homeDetentionCurfewEligibilityDate: '2017-10-07',
            conditionalReleaseDate: '2017-12-15',
            releaseDate: '2017-12-15',
          },
        }

        beforeEach(() => {
          clock = sinon.useFakeTimers(new Date('May 31, 2018 00:00:00').getTime())
        })

        afterEach(() => {
          clock.restore()
        })

        it('should add Today to those received today', async () => {
          roService.getROPrisoners.resolves([offender1])
          licenceClient.getLicences.resolves([
            { booking_id: 'a', transition_date: '2018-05-31 15:23:39.530927', stage: 'PROCESSING_RO' },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, 'RO')
          expect(hdcEligible[0].received).to.eql({ text: 'Today', days: '0' })
        })

        it('should add the number of days until hdced', async () => {
          roService.getROPrisoners.resolves([offender1])
          licenceClient.getLicences.resolves([
            { booking_id: 'a', transition_date: '2018-05-20 15:23:39.530927', stage: 'PROCESSING_RO' },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, 'RO')
          expect(hdcEligible[0].received).to.eql({ text: '10 days ago', days: '10' })
        })

        it('should not add the number of days if not in PROCESSING_RO', async () => {
          roService.getROPrisoners.resolves([offender1])
          licenceClient.getLicences.resolves([
            { booking_id: 'a', transition_date: '2018-05-16 15:23:39.530927', stage: 'MODIFIED' },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, 'RO')
          expect(hdcEligible[0].received).to.be.undefined()
        })

        it('should order on days since received first', async () => {
          roService.getROPrisoners.resolves([offender1, offender2])
          licenceClient.getLicences.resolves([
            { booking_id: 'a', transition_date: '2018-05-20 15:23:39.530927', stage: 'PROCESSING_RO' },
            { booking_id: 'b', transition_date: '2018-05-18 15:23:39.530927', stage: 'PROCESSING_RO' },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, 'RO')
          expect(hdcEligible[0].bookingId).to.eql('b')
          expect(hdcEligible[1].bookingId).to.eql('a')
        })

        it('should order on days since received first', async () => {
          roService.getROPrisoners.resolves([offender1, offender2])
          licenceClient.getLicences.resolves([
            { booking_id: 'a', transition_date: '2018-05-17 15:23:39.530927', stage: 'PROCESSING_RO' },
            { booking_id: 'b', transition_date: '2018-05-18 15:23:39.530927', stage: 'PROCESSING_RO' },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, 'RO')
          expect(hdcEligible[0].bookingId).to.eql('a')
          expect(hdcEligible[1].bookingId).to.eql('b')
        })

        it('should prioritise those with received date', async () => {
          roService.getROPrisoners.resolves([offender1, offender2])
          licenceClient.getLicences.resolves([
            { booking_id: 'a', transition_date: '2018-05-17 15:23:39.530927', stage: 'MODIFIED' },
            { booking_id: 'b', transition_date: '2018-05-18 15:23:39.530927', stage: 'PROCESSING_RO' },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, 'RO')
          expect(hdcEligible[0].bookingId).to.eql('b')
          expect(hdcEligible[1].bookingId).to.eql('a')
        })

        it('should sort by release date if neither have received date', async () => {
          roService.getROPrisoners.resolves([offender2, offender1])
          licenceClient.getLicences.resolves([
            { booking_id: 'a', transition_date: '2018-05-17 15:23:39.530927', stage: 'MODIFIED' },
            { booking_id: 'b', transition_date: '2018-05-18 15:23:39.530927', stage: 'MODIFIED' },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, 'RO')
          expect(hdcEligible[0].bookingId).to.eql('a')
          expect(hdcEligible[1].bookingId).to.eql('b')
        })
      })
    })

    describe('sorting', () => {
      const offender1 = {
        name: 'offender1',
        sentenceDetail: {
          homeDetentionCurfewEligibilityDate: '2017-09-14',
          conditionalReleaseDate: '2017-12-15',
          releaseDate: '2017-12-15',
        },
      }
      const offender2 = {
        name: 'offender2',
        sentenceDetail: {
          homeDetentionCurfewEligibilityDate: '2017-10-07',
          conditionalReleaseDate: '2017-12-15',
          releaseDate: '2017-12-15',
        },
      }
      const offender3 = {
        name: 'offender3',
        sentenceDetail: {
          homeDetentionCurfewEligibilityDate: '2017-11-06',
          conditionalReleaseDate: '2017-01-13',
          releaseDate: '2017-01-13',
        },
      }

      const offender4 = {
        name: 'offender4',
        sentenceDetail: {
          homeDetentionCurfewEligibilityDate: '2017-11-07',
          conditionalReleaseDate: '2017-07-22',
          releaseDate: '2017-07-22',
        },
      }

      const offender5 = {
        name: 'offender5',
        sentenceDetail: {
          homeDetentionCurfewEligibilityDate: '2017-11-07',
          conditionalReleaseDate: '2017-12-13',
          releaseDate: '2017-12-13',
        },
      }

      it('should order by homeDetentionCurfewEligibilityDate first', async () => {
        nomisClient.getHdcEligiblePrisoners.resolves([offender3, offender1, offender2])

        const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)

        expect(hdcEligible[0].name).to.eql('offender1')
        expect(hdcEligible[1].name).to.eql('offender2')
        expect(hdcEligible[2].name).to.eql('offender3')
      })

      it('should order by releaseDate second', async () => {
        nomisClient.getHdcEligiblePrisoners.resolves([offender5, offender4, offender3])

        const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)

        expect(hdcEligible[0].name).to.eql('offender3')
        expect(hdcEligible[1].name).to.eql('offender4')
        expect(hdcEligible[2].name).to.eql('offender5')
      })
    })

    describe('Filtering', () => {
      const caseListFormatter = {
        formatCaseList: sinon.stub(),
      }

      const caseListAllStatuses = [
        { stage: 'ELIGIBILITY', activeCase: true },
        { stage: 'PROCESSING_RO', activeCase: true },
        { stage: 'PROCESSING_CA', activeCase: true },
        { stage: 'APPROVAL', activeCase: true },
        { stage: 'DECIDED', activeCase: true },
        { stage: 'MODIFIED', activeCase: true },
        { stage: 'MODIFIED_APPROVAL', activeCase: true },
        { stage: 'PROCESSING_CA', status: 'Postponed', activeCase: true },
      ]

      beforeEach(() => {
        nomisClient.getHdcEligiblePrisoners.resolves([{ sentenceDetail: { homeDetentionCurfewEligibilityDate: 'a' } }])
        const nomisClientBuilder = sinon.stub().returns(nomisClient)
        service = createCaseListService(nomisClientBuilder, roService, licenceClient, caseListFormatter)
      })

      describe('By stage', () => {
        context('user is CA', () => {
          it('should not filter any statuses out', () => {
            caseListFormatter.formatCaseList.resolves(caseListAllStatuses)

            return expect(service.getHdcCaseList(user.token, user.username, 'CA', 'active')).to.eventually.eql({
              hdcEligible: caseListAllStatuses,
            })
          })
        })

        context('user is RO', () => {
          it('should filter any statuses out', () => {
            caseListFormatter.formatCaseList.resolves(caseListAllStatuses)

            return expect(service.getHdcCaseList(user.token, user.username, 'RO', 'active')).to.eventually.eql({
              hdcEligible: [
                { stage: 'PROCESSING_RO', activeCase: true },
                { stage: 'PROCESSING_CA', activeCase: true },
                { stage: 'APPROVAL', activeCase: true },
                { stage: 'DECIDED', activeCase: true },
                { stage: 'MODIFIED', activeCase: true },
                { stage: 'MODIFIED_APPROVAL', activeCase: true },
                { stage: 'PROCESSING_CA', status: 'Postponed', activeCase: true },
              ],
            })
          })
        })

        context('user is DM', () => {
          it('should filter any statuses out', () => {
            caseListFormatter.formatCaseList.resolves(caseListAllStatuses)

            return expect(service.getHdcCaseList(user.token, user.username, 'DM', 'active')).to.eventually.eql({
              hdcEligible: [
                { stage: 'APPROVAL', activeCase: true },
                { stage: 'DECIDED', activeCase: true },
                { stage: 'PROCESSING_CA', status: 'Postponed', activeCase: true },
              ],
            })
          })
        })
      })

      describe('by tab', () => {
        const allStatuses = [
          {
            stage: 'ELIGIBILITY',
            status: 'Not started',
            activeCase: true,
          },
          { stage: 'ELIGIBILITY', status: 'Refused', activeCase: false },
        ]

        it('should remove inactive statuses when tab is active', () => {
          caseListFormatter.formatCaseList.resolves(allStatuses)

          return expect(service.getHdcCaseList(user.token, user.username, 'CA', 'active')).to.eventually.eql({
            hdcEligible: [
              {
                stage: 'ELIGIBILITY',
                status: 'Not started',
                activeCase: true,
              },
            ],
          })
        })

        it('should remove active statuses when tab is inactive', () => {
          caseListFormatter.formatCaseList.resolves(allStatuses)

          return expect(service.getHdcCaseList(user.token, user.username, 'CA', 'inactive')).to.eventually.eql({
            hdcEligible: [{ stage: 'ELIGIBILITY', status: 'Refused', activeCase: false }],
          })
        })
      })
    })
  })
})
