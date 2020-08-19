const createCaseListService = require('../../server/services/caseListService')
const createCaseListFormatter = require('../../server/services/utils/caseListFormatter')
const { createRoServiceStub } = require('../mockServices')

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
      getHdcEligiblePrisoners: jest.fn(),
    }

    roService = createRoServiceStub()
    roService.getROPrisoners.mockReturnValue([
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
    ])

    roService.getStaffByUsername.mockReturnValue({
      username: 'username',
      email: 'email',
      staffCode: 'ABC123',
      staff: { forenames: 'user', surname: 'name' },
      teams: [],
    })

    licenceClient = {
      getLicences: jest.fn().mockReturnValue([]),
      getDeliusIds: jest.fn().mockReturnValue([{ staffCode: 'foo-username' }]),
      deleteAll: undefined,
      deleteAllTest: undefined,
      getLicence: undefined,
      getApprovedLicenceVersion: undefined,
      createLicence: undefined,
      updateLicence: undefined,
      updateSection: undefined,
      updateStage: undefined,
      saveApprovedLicenceVersion: undefined,
      getLicencesInStageBetweenDates: undefined,
      getLicencesInStageBeforeDate: undefined,
    }

    const nomisClientBuilder = jest.fn().mockReturnValue(nomisClient)
    const caseListFormatter = createCaseListFormatter(licenceClient)

    service = createCaseListService(nomisClientBuilder, roService, licenceClient, caseListFormatter)
  })

  describe('getHdcCaseList', () => {
    test('should format dates', async () => {
      nomisClient.getHdcEligiblePrisoners.mockResolvedValue(hdcEligiblePrisoners)

      const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)

      expect(hdcEligible[0].sentenceDetail.homeDetentionCurfewEligibilityDate).toBe('07/09/2017')
      expect(hdcEligible[0].sentenceDetail.effectiveConditionalReleaseDate).toBe('16/12/2017')
    })

    test('should capitalise names', async () => {
      nomisClient.getHdcEligiblePrisoners.mockResolvedValue(hdcEligiblePrisoners)
      const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
      expect(hdcEligible[0].firstName).toBe('Mark')
      expect(hdcEligible[0].lastName).toBe('Andrews')
    })

    test('should add a status to the prisoners', async () => {
      nomisClient.getHdcEligiblePrisoners.mockResolvedValue(hdcEligiblePrisoners)
      const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
      expect(hdcEligible[0].status).toBe('Not started')
    })

    test('should add a processing stage to the prisoners', async () => {
      nomisClient.getHdcEligiblePrisoners.mockResolvedValue(hdcEligiblePrisoners)
      const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
      expect(hdcEligible[0].stage).toBe('UNSTARTED')
    })

    test('should return empty array and message if no results', () => {
      nomisClient.getHdcEligiblePrisoners.mockResolvedValue([])
      return expect(service.getHdcCaseList(user.token, user.username, user.role)).resolves.toEqual(
        noEligibleCasesResponse
      )
    })

    test('should return empty array if null returned', () => {
      nomisClient.getHdcEligiblePrisoners.mockResolvedValue(null)
      return expect(service.getHdcCaseList(user.token, user.username, user.role)).resolves.toEqual(
        noEligibleCasesResponse
      )
    })

    describe('when user is a CA', () => {
      let realDateNow

      beforeEach(() => {
        const time = new Date('May 31, 2018 00:00:00')
        realDateNow = Date.now.bind(global.Date)
        jest.spyOn(Date, 'now').mockImplementation(() => time.getTime())
      })

      afterEach(() => {
        global.Date.now = realDateNow
      })

      test('should call getHdcEligiblePrisoners from nomisClient', () => {
        service.getHdcCaseList(user.token, user.username, user.role)
        expect(nomisClient.getHdcEligiblePrisoners).toHaveBeenCalled()
        expect(nomisClient.getHdcEligiblePrisoners).toHaveBeenCalledWith()
      })

      test('should return eligible prisoners', async () => {
        nomisClient.getHdcEligiblePrisoners.mockResolvedValue(hdcEligiblePrisoners)
        const result = await service.getHdcCaseList(user.token, user.username, user.role)
        expect(result.hdcEligible).toEqual(formattedPrisoners)
      })

      test('should return message when no eligible prisoners', async () => {
        nomisClient.getHdcEligiblePrisoners.mockResolvedValue([])
        const result = await service.getHdcCaseList(user.token, user.username, user.role)
        expect(result).toEqual({ hdcEligible: [], message: 'No HDC cases' })
      })

      describe('adding the hdced countdown', () => {
        test('should add the number of days until hdced', async () => {
          nomisClient.getHdcEligiblePrisoners.mockResolvedValue([
            {
              ...hdcEligiblePrisoners[0],
              sentenceDetail: {
                ...hdcEligiblePrisoners[0].sentenceDetail,
                homeDetentionCurfewEligibilityDate: '2018-06-01',
              },
            },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
          expect(hdcEligible[0].due).toEqual({ text: '1 day', overdue: false })
        })

        test('should show 0 days if it is today', async () => {
          nomisClient.getHdcEligiblePrisoners.mockResolvedValue([
            {
              ...hdcEligiblePrisoners[0],
              sentenceDetail: {
                ...hdcEligiblePrisoners[0].sentenceDetail,
                homeDetentionCurfewEligibilityDate: '2018-05-31',
              },
            },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
          expect(hdcEligible[0].due).toEqual({ text: '0 days', overdue: false })
        })

        test('should set overdue if in the past', async () => {
          nomisClient.getHdcEligiblePrisoners.mockResolvedValue([
            {
              ...hdcEligiblePrisoners[0],
              sentenceDetail: {
                ...hdcEligiblePrisoners[0].sentenceDetail,
                homeDetentionCurfewEligibilityDate: '2018-05-30',
              },
            },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
          expect(hdcEligible[0].due).toEqual({ text: '1 day overdue', overdue: true })
        })

        test('should add in weeks if longer than 14 days', async () => {
          nomisClient.getHdcEligiblePrisoners.mockResolvedValue([
            {
              ...hdcEligiblePrisoners[0],
              sentenceDetail: {
                ...hdcEligiblePrisoners[0].sentenceDetail,
                homeDetentionCurfewEligibilityDate: '2018-06-14',
              },
            },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
          expect(hdcEligible[0].due).toEqual({ text: '2 weeks', overdue: false })
        })

        test('should add in days if less than 14 days', async () => {
          nomisClient.getHdcEligiblePrisoners.mockResolvedValue([
            {
              ...hdcEligiblePrisoners[0],
              sentenceDetail: {
                ...hdcEligiblePrisoners[0].sentenceDetail,
                homeDetentionCurfewEligibilityDate: '2018-06-13',
              },
            },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
          expect(hdcEligible[0].due).toEqual({ text: '13 days', overdue: false })
        })

        test('should add in months if longer than 12 weeks', async () => {
          nomisClient.getHdcEligiblePrisoners.mockResolvedValue([
            {
              ...hdcEligiblePrisoners[0],
              sentenceDetail: {
                ...hdcEligiblePrisoners[0].sentenceDetail,
                homeDetentionCurfewEligibilityDate: '2019-01-19',
              },
            },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
          expect(hdcEligible[0].due).toEqual({ text: '7 months', overdue: false })
        })

        test('should add in years if longer than 18 months', async () => {
          nomisClient.getHdcEligiblePrisoners.mockResolvedValue([
            {
              ...hdcEligiblePrisoners[0],
              sentenceDetail: {
                ...hdcEligiblePrisoners[0].sentenceDetail,
                homeDetentionCurfewEligibilityDate: '2020-07-01',
              },
            },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)
          expect(hdcEligible[0].due).toEqual({ text: '2 years', overdue: false })
        })
      })
    })

    describe('when user is a RO', () => {
      test('should call getROPrisoners', async () => {
        roService.getROPrisoners.mockResolvedValue(roPrisoners)
        await service.getHdcCaseList(ROUser.token, ROUser.username, ROUser.role)
        expect(roService.getROPrisoners).toHaveBeenCalled()
      })

      test('should call getROPrisoners when staff not found in delius', async () => {
        roService.getROPrisoners.mockResolvedValueOnce(null)
        await service.getHdcCaseList(ROUser.token, ROUser.username, ROUser.role)
        expect(roService.getROPrisoners).toHaveBeenCalled()
      })

      test('should call getROPrisoners when staff not found in delius but has fallback', async () => {
        licenceClient.getDeliusIds.mockResolvedValue([{ staffCode: 'delius_id', deliusUsername: 'deliusUser' }])
        roService.getStaffByUsername.mockResolvedValue({ staffCode: 'ABC123' })

        roService.getROPrisoners.mockResolvedValueOnce(null).mockResolvedValueOnce(roPrisoners)

        await service.getHdcCaseList(ROUser.token, ROUser.username, ROUser.role)

        expect(roService.getROPrisoners).toHaveBeenCalledWith('DELIUS_ID', 'token')
        expect(roService.getROPrisoners).toHaveBeenCalledWith('ABC123', 'token')
      })

      test('should call getROPrisoners when staff not found in delius and fallback not found', async () => {
        licenceClient.getDeliusIds.mockResolvedValue([{ staffCode: 'delius_id', deliusUsername: 'deliusUser' }])
        roService.getStaffByUsername.mockResolvedValue(null)

        roService.getROPrisoners.mockResolvedValueOnce(null)

        return expect(service.getHdcCaseList(ROUser.token, ROUser.username, ROUser.role)).rejects.toStrictEqual(
          Error('Staff details not found in Delius for username: deliusUser')
        )
      })

      test('should call getDeliusIds without capitalising username', async () => {
        licenceClient.getDeliusIds.mockResolvedValue(undefined)
        await service.getHdcCaseList(ROUser.token, 'aAaA', ROUser.role)
        expect(licenceClient.getDeliusIds).toHaveBeenCalledWith('aAaA')
      })

      test('should use uppercase delius username when calling roService', async () => {
        licenceClient.getDeliusIds.mockResolvedValue([{ staffCode: 'delius_id' }])
        await service.getHdcCaseList(ROUser.token, 'user', ROUser.role)
        expect(roService.getROPrisoners).toHaveBeenCalled()
        expect(roService.getROPrisoners).toHaveBeenCalledWith('DELIUS_ID', ROUser.token)
      })

      test('should return empty array and explanation message if no eligible releases found', async () => {
        roService.getROPrisoners.mockResolvedValue([])
        const result = await service.getHdcCaseList(ROUser.token, ROUser.username, ROUser.role)
        expect(result).toEqual({ hdcEligible: [], message: 'No HDC cases' })
      })

      test('should return empty array and explanation message if no delius user name found locally or in delius', async () => {
        licenceClient.getDeliusIds.mockResolvedValue(undefined)
        roService.getStaffByUsername.mockResolvedValue(undefined)
        const result = await service.getHdcCaseList(ROUser.token, ROUser.username, ROUser.role)
        expect(result).toEqual({ hdcEligible: [], message: 'Staff details not found in Delius for username: 123' })
      })

      test('should return empty array and explanation message if too many delius user names found and username not found in Delius', async () => {
        licenceClient.getDeliusIds.mockResolvedValue([{ staffCode: '1' }, { staffCode: '2' }])
        roService.getStaffByUsername.mockResolvedValue(undefined)
        const result = await service.getHdcCaseList(ROUser.token, ROUser.username, ROUser.role)
        expect(result).toEqual({ hdcEligible: [], message: 'Staff details not found in Delius for username: 123' })
      })

      test('delius interaction throws', () => {
        licenceClient.getDeliusIds.mockResolvedValue(undefined)
        roService.getStaffByUsername = jest.fn().mockRejectedValue('Delius went bang!')
        return expect(service.getHdcCaseList(ROUser.token, ROUser.username, ROUser.role)).rejects.not.toBeNull()
      })

      test("staff details found in Delius, but there's no staff code", async () => {
        licenceClient.getDeliusIds.mockResolvedValue(undefined)
        roService.getStaffByUsername.mockResolvedValue({
          username: '123',
          email: 'email',
          staff: { forenames: 'user', surname: 'name' },
          teams: [],
        })
        const result = await service.getHdcCaseList(ROUser.token, ROUser.username, ROUser.role)
        expect(result).toEqual({ hdcEligible: [], message: 'Delius did not supply a staff code for username 123' })
      })

      describe('days since case received', () => {
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

        let realDateNow

        beforeEach(() => {
          const time = new Date('May 31, 2018 00:00:00')
          realDateNow = Date.now.bind(global.Date)
          jest.spyOn(Date, 'now').mockImplementation(() => time.getTime())
        })

        afterEach(() => {
          global.Date.now = realDateNow
        })

        test('should add Today to those received today', async () => {
          roService.getROPrisoners.mockResolvedValue([offender1])
          licenceClient.getLicences.mockResolvedValue([
            { booking_id: 'a', transition_date: '2018-05-31 15:23:39.530927', stage: 'PROCESSING_RO' },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, 'RO')
          expect(hdcEligible[0].received).toEqual({ text: 'Today', days: '0' })
        })

        test('should add the number of days until hdced', async () => {
          roService.getROPrisoners.mockResolvedValue([offender1])
          licenceClient.getLicences.mockResolvedValue([
            { booking_id: 'a', transition_date: '2018-05-20 15:23:39.530927', stage: 'PROCESSING_RO' },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, 'RO')
          expect(hdcEligible[0].received).toEqual({ text: '10 days ago', days: '10' })
        })

        test('should not add the number of days if not in PROCESSING_RO', async () => {
          roService.getROPrisoners.mockResolvedValue([offender1])
          licenceClient.getLicences.mockResolvedValue([
            { booking_id: 'a', transition_date: '2018-05-16 15:23:39.530927', stage: 'MODIFIED' },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, 'RO')
          expect(hdcEligible[0].received).toBeUndefined()
        })

        test('should order on days since received first', async () => {
          roService.getROPrisoners.mockResolvedValue([offender1, offender2])
          licenceClient.getLicences.mockResolvedValue([
            { booking_id: 'a', transition_date: '2018-05-20 15:23:39.530927', stage: 'PROCESSING_RO' },
            { booking_id: 'b', transition_date: '2018-05-18 15:23:39.530927', stage: 'PROCESSING_RO' },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, 'RO')
          expect(hdcEligible[0].bookingId).toBe('b')
          expect(hdcEligible[1].bookingId).toBe('a')
        })

        test('should order on days since received first', async () => {
          roService.getROPrisoners.mockResolvedValue([offender1, offender2])
          licenceClient.getLicences.mockResolvedValue([
            { booking_id: 'a', transition_date: '2018-05-17 15:23:39.530927', stage: 'PROCESSING_RO' },
            { booking_id: 'b', transition_date: '2018-05-18 15:23:39.530927', stage: 'PROCESSING_RO' },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, 'RO')
          expect(hdcEligible[0].bookingId).toBe('a')
          expect(hdcEligible[1].bookingId).toBe('b')
        })

        test('should prioritise those with received date', async () => {
          roService.getROPrisoners.mockResolvedValue([offender1, offender2])
          licenceClient.getLicences.mockResolvedValue([
            { booking_id: 'a', transition_date: '2018-05-17 15:23:39.530927', stage: 'MODIFIED' },
            { booking_id: 'b', transition_date: '2018-05-18 15:23:39.530927', stage: 'PROCESSING_RO' },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, 'RO')
          expect(hdcEligible[0].bookingId).toBe('b')
          expect(hdcEligible[1].bookingId).toBe('a')
        })

        test('should sort by release date if neither have received date', async () => {
          roService.getROPrisoners.mockResolvedValue([offender2, offender1])
          licenceClient.getLicences.mockResolvedValue([
            { booking_id: 'a', transition_date: '2018-05-17 15:23:39.530927', stage: 'MODIFIED' },
            { booking_id: 'b', transition_date: '2018-05-18 15:23:39.530927', stage: 'MODIFIED' },
          ])

          const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, 'RO')
          expect(hdcEligible[0].bookingId).toBe('a')
          expect(hdcEligible[1].bookingId).toBe('b')
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

      test('should order by homeDetentionCurfewEligibilityDate first', async () => {
        nomisClient.getHdcEligiblePrisoners.mockResolvedValue([offender3, offender1, offender2])

        const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)

        expect(hdcEligible[0].name).toBe('offender1')
        expect(hdcEligible[1].name).toBe('offender2')
        expect(hdcEligible[2].name).toBe('offender3')
      })

      test('should order by releaseDate second', async () => {
        nomisClient.getHdcEligiblePrisoners.mockResolvedValue([offender5, offender4, offender3])

        const { hdcEligible } = await service.getHdcCaseList(user.token, user.username, user.role)

        expect(hdcEligible[0].name).toBe('offender3')
        expect(hdcEligible[1].name).toBe('offender4')
        expect(hdcEligible[2].name).toBe('offender5')
      })
    })

    describe('Filtering', () => {
      const caseListFormatter = {
        formatCaseList: jest.fn(),
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
        nomisClient.getHdcEligiblePrisoners.mockResolvedValue([
          { sentenceDetail: { homeDetentionCurfewEligibilityDate: 'a' } },
        ])
        const nomisClientBuilder = jest.fn().mockReturnValue(nomisClient)
        service = createCaseListService(nomisClientBuilder, roService, licenceClient, caseListFormatter)
      })

      describe('By stage', () => {
        describe('user is CA', () => {
          test('should not filter any statuses out', () => {
            caseListFormatter.formatCaseList.mockResolvedValue(caseListAllStatuses)

            return expect(service.getHdcCaseList(user.token, user.username, 'CA', 'active')).resolves.toEqual({
              hdcEligible: caseListAllStatuses,
            })
          })
        })

        describe('user is RO', () => {
          test('should filter any statuses out', () => {
            caseListFormatter.formatCaseList.mockResolvedValue(caseListAllStatuses)

            return expect(service.getHdcCaseList(user.token, user.username, 'RO', 'active')).resolves.toEqual({
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

        describe('user is DM', () => {
          test('should filter any statuses out', () => {
            caseListFormatter.formatCaseList.mockResolvedValue(caseListAllStatuses)

            return expect(service.getHdcCaseList(user.token, user.username, 'DM', 'active')).resolves.toEqual({
              hdcEligible: [
                { stage: 'APPROVAL', activeCase: true },
                { stage: 'DECIDED', activeCase: true },
                { stage: 'MODIFIED', activeCase: true },
                { stage: 'MODIFIED_APPROVAL', activeCase: true },
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

        test('should remove inactive statuses when tab is active', () => {
          caseListFormatter.formatCaseList.mockResolvedValue(allStatuses)

          return expect(service.getHdcCaseList(user.token, user.username, 'CA', 'active')).resolves.toEqual({
            hdcEligible: [
              {
                stage: 'ELIGIBILITY',
                status: 'Not started',
                activeCase: true,
              },
            ],
          })
        })

        test('should remove active statuses when tab is inactive', () => {
          caseListFormatter.formatCaseList.mockResolvedValue(allStatuses)

          return expect(service.getHdcCaseList(user.token, user.username, 'CA', 'inactive')).resolves.toEqual({
            hdcEligible: [{ stage: 'ELIGIBILITY', status: 'Refused', activeCase: false }],
          })
        })
      })
    })
  })
})
