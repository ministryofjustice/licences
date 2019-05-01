const proxyquire = require('proxyquire')
const varyConfig = require('../../server/routes/config/vary')

proxyquire.noCallThru()

const createLicenceService = require('../../server/services/licenceService')

describe('licenceService', () => {
  let licenceClient
  let service

  const establishmentsClient = {
    findById: sinon.stub().resolves({ a: 'b' }),
  }

  beforeEach(() => {
    licenceClient = {
      getLicence: sinon.stub().resolves({ licence: { a: 'b' }, version: 2, vary_version: 5 }),
      createLicence: sinon.stub().resolves('abc'),
      updateSection: sinon.stub().resolves(),
      updateStage: sinon.stub().resolves(),
      getAdditionalConditions: sinon.stub().returns([{ user_input: 1, id: 1, field_position: null }]),
      updateLicence: sinon.stub().resolves(),
      updateStageAndVersion: sinon.stub().resolves(),
      getApprovedLicenceVersion: sinon.stub().resolves({ version: 2, vary_version: 4 }),
    }
    service = createLicenceService(licenceClient, establishmentsClient)
  })

  describe('getLicence', () => {
    it('should request licence details from client', () => {
      service.getLicence('123')

      expect(licenceClient.getLicence).to.be.calledOnce()
      expect(licenceClient.getLicence).to.be.calledWith('123')
    })

    it('should return licence', () => {
      return expect(service.getLicence('123')).to.eventually.eql({
        licence: { a: 'b' },
        stage: undefined,
        version: '2.5',
        approvedVersion: '2.4',
        approvedVersionDetails: {
          vary_version: 4,
          version: 2,
        },
        versionDetails: {
          vary_version: 5,
          version: 2,
        },
      })
    })

    it('should throw if error getting licence', () => {
      licenceClient.getLicence.rejects()
      return expect(service.getLicence('123')).to.eventually.be.rejected()
    })
  })

  describe('createLicence', () => {
    it('should create a licence', () => {
      service.createLicence({ bookingId: '123' })

      expect(licenceClient.createLicence).to.be.calledOnce()
      expect(licenceClient.createLicence).to.be.calledWith('123', {}, undefined)
    })

    it('should pass in the licence', () => {
      service.createLicence({ bookingId: '123', data: { firstName: 'M' } })

      expect(licenceClient.createLicence).to.be.calledOnce()
      expect(licenceClient.createLicence).to.be.calledWith('123', { firstName: 'M' })
    })

    it('should pass in the stage', () => {
      service.createLicence({ bookingId: '123', data: { firstName: 'M' }, stage: 'VARY' })

      expect(licenceClient.createLicence).to.be.calledOnce()
      expect(licenceClient.createLicence).to.be.calledWith('123', { firstName: 'M' }, 'VARY')
    })

    it('should pass in vary version as 1 if stage is VARY', () => {
      service.createLicence({ bookingId: '123', data: { firstName: 'M' }, stage: 'VARY' })

      expect(licenceClient.createLicence).to.be.calledOnce()
      expect(licenceClient.createLicence).to.be.calledWith('123', { firstName: 'M' }, 'VARY', 1, 1)
    })

    it('should pass in vary version as 0 if stage is not VARY', () => {
      service.createLicence({ bookingId: '123', data: { firstName: 'M' } })

      expect(licenceClient.createLicence).to.be.calledOnce()
      expect(licenceClient.createLicence).to.be.calledWith('123', { firstName: 'M' }, undefined, 1, 0)
    })

    it('should return returned id', () => {
      return expect(service.createLicence('123')).to.eventually.eql('abc')
    })

    it('should throw if error getting licence', () => {
      licenceClient.createLicence.rejects()
      return expect(service.createLicence('123')).to.eventually.be.rejected()
    })
  })

  describe('updateLicenceConditions', () => {
    let standardLicence

    beforeEach(() => {
      standardLicence = { licence: { a: 'b' } }
    })

    it('should call update section with conditions from the licence client merged with existing', async () => {
      const existingLicence = {
        licence: {
          licenceConditions: { standard: { additionalConditionsRequired: 'Yes' } },
        },
      }

      await service.updateLicenceConditions(
        'ab1',
        existingLicence,
        {
          additional: { NOCONTACTPRISONER: {} },
          bespoke: [{ text: 'bespoke' }],
        },
        false
      )

      expect(licenceClient.updateSection).to.be.calledOnce()
      expect(licenceClient.updateSection).to.be.calledWith(
        'licenceConditions',
        'ab1',
        {
          standard: { additionalConditionsRequired: 'Yes' },
          additional: { NOCONTACTPRISONER: {} },
          bespoke: [{ text: 'bespoke' }],
        },
        false
      )
    })

    it('should not call update section if no changes have been made', async () => {
      const existingLicence = {
        licence: {
          licenceConditions: {
            standard: { additionalConditionsRequired: 'Yes' },
            additional: { NOCONTACTPRISONER: {} },
            bespoke: [{ text: 'bespoke' }],
          },
        },
      }

      await service.updateLicenceConditions('ab1', existingLicence, {
        additional: { NOCONTACTPRISONER: {} },
        bespoke: [{ text: 'bespoke' }],
      })

      expect(licenceClient.updateSection).to.not.be.called()
    })

    it('should throw if error updating licence', () => {
      licenceClient.updateSection.rejects()
      const args = {
        bookingId: 'ab1',
        existingLicence: standardLicence,
        additionalConditions: ['Scotland Street'],
      }
      return expect(service.updateLicenceConditions(args)).to.eventually.be.rejected()
    })

    describe('post approval modifications', () => {
      it('should change stage to MODIFIED_APPROVAL when updates occur', async () => {
        const existingLicence = { stage: 'DECIDED', licence: { a: 'b' } }
        await service.updateLicenceConditions('ab1', existingLicence, {
          additionalConditions: 'NOCONTACTPRISONER',
        })

        expect(licenceClient.updateStage).to.be.calledOnce()
        expect(licenceClient.updateStage).to.be.calledWith('ab1', 'MODIFIED_APPROVAL')
      })

      it('should change stage to MODIFIED_APPROVAL when updates occur in MODIFIED stage', async () => {
        const existingLicence = { stage: 'MODIFIED', licence: { a: 'b' } }
        await service.updateLicenceConditions('ab1', existingLicence, {
          additionalConditions: 'NOCONTACTPRISONER',
        })

        expect(licenceClient.updateStage).to.be.calledOnce()
        expect(licenceClient.updateStage).to.be.calledWith('ab1', 'MODIFIED_APPROVAL')
      })

      it('should not change stage if not DECIDED', async () => {
        const existingLicence = { stage: 'PROCESSING_RO', licence: { a: 'b' } }
        await service.updateLicenceConditions('ab1', existingLicence, {
          additionalConditions: 'NOCONTACTPRISONER',
        })

        expect(licenceClient.updateStage).to.not.be.calledOnce()
      })

      it('should not change stage if no changes', async () => {
        const existingLicence = {
          stage: 'PROCESSING_RO',
          licence: { licenceConditions: { additionalConditions: { additional: { key: 'var' } } } },
        }
        await service.updateLicenceConditions('ab1', existingLicence, {
          additionalConditions: 'NOCONTACTPRISONER',
        })

        expect(licenceClient.updateStage).to.not.be.calledOnce()
      })
    })
  })

  describe('deleteLicenceCondition', () => {
    it('should remove additional condition by ID and call update section', async () => {
      const existingLicence = {
        licence: {
          licenceConditions: {
            standard: { additionalConditionsRequired: 'Yes' },
            additional: { 1: {}, 2: {}, 3: {} },
            bespoke: [{ text: 'bespoke' }],
          },
        },
      }

      await service.deleteLicenceCondition('ab1', existingLicence, '2')

      expect(licenceClient.updateSection).to.be.calledOnce()
      expect(licenceClient.updateSection).to.be.calledWith('licenceConditions', 'ab1', {
        standard: { additionalConditionsRequired: 'Yes' },
        additional: { 1: {}, 3: {} },
        bespoke: [{ text: 'bespoke' }],
      })
    })

    it('should remove bespoke condition by index when id is "bespoke-index", and call update section', async () => {
      const existingLicence = {
        licence: {
          licenceConditions: {
            standard: { additionalConditionsRequired: 'Yes' },
            additional: { 1: {}, 2: {}, 'bespoke-1': {} },
            bespoke: [{ text: '0' }, { text: '1' }, { text: '2' }],
          },
        },
      }

      await service.deleteLicenceCondition('ab1', existingLicence, 'bespoke-1')

      expect(licenceClient.updateSection).to.be.calledOnce()
      expect(licenceClient.updateSection).to.be.calledWith('licenceConditions', 'ab1', {
        standard: { additionalConditionsRequired: 'Yes' },
        additional: { 1: {}, 2: {}, 'bespoke-1': {} },
        bespoke: [{ text: '0' }, { text: '2' }],
      })
    })

    it('should throw if error updating licence', () => {
      licenceClient.updateSection.rejects()
      return expect(service.deleteLicenceCondition('ab1', {}, 'bespoke-1')).to.eventually.be.rejected()
    })
  })

  describe('markForHandover', () => {
    it('should call updateStage from the licence client', () => {
      service.markForHandover('ab1', 'caToRo')

      expect(licenceClient.updateStage).to.be.calledOnce()
      expect(licenceClient.updateStage).to.be.calledWith('ab1', 'PROCESSING_RO')
    })

    it('should change stage according to transition', () => {
      service.markForHandover('ab1', 'caToDm')
      expect(licenceClient.updateStage).to.be.calledWith('ab1', 'APPROVAL')
    })

    it('should return to ELIGIBILITY when RO sends to CA after opt out', () => {
      service.markForHandover('ab1', 'roToCaOptedOut')
      expect(licenceClient.updateStage).to.be.calledWith('ab1', 'ELIGIBILITY')
    })

    it('should return to ELIGIBILITY when RO sends to CA after address rejected', () => {
      service.markForHandover('ab1', 'roToCaAddressRejected')
      expect(licenceClient.updateStage).to.be.calledWith('ab1', 'ELIGIBILITY')
    })

    it('should send to PROCESSING_CA if transition type of dmToCaReturn is passed in', () => {
      service.markForHandover('ab1', 'dmToCaReturn')
      expect(licenceClient.updateStage).to.be.calledWith('ab1', 'PROCESSING_CA')
    })

    it('should throw if error during update status', () => {
      licenceClient.updateStage.rejects()
      return expect(service.markForHandover('ab1', 'caToRo')).to.eventually.be.rejected()
    })

    it('should throw if no matching transition type', () => {
      expect(() => service.markForHandover('ab1', 'caToBlah')).to.throw(Error)
    })
  })

  describe('removeDecision', () => {
    const licence = {
      licence: {
        approval: {
          release: {
            decision: 'Yes',
          },
          also: 'This',
        },
        somethingElse: 'Yes',
      },
    }

    it('should call updateStage from the licence client', async () => {
      await service.removeDecision('ab1', licence)

      expect(licenceClient.updateLicence).to.be.calledOnce()
      expect(licenceClient.updateLicence).to.be.calledWith('ab1', { somethingElse: 'Yes' })
    })
  })

  describe('addSplitDateFields', () => {
    it('should add day, month and year fields to split dates', () => {
      const rawData = {
        someDate: '12/03/2019',
        somethingElse: '19/03/2019',
      }
      const formFieldsConfig = [
        { someDate: { splitDate: { day: 'someDay', month: 'someMonth', year: 'someYear' } } },
        { somethingElse: {} },
      ]

      expect(service.addSplitDateFields(rawData, formFieldsConfig)).to.eql({
        someDate: '12/03/2019',
        someDay: '12',
        someMonth: '03',
        someYear: '2019',
        somethingElse: '19/03/2019',
      })
    })

    it('should return as is if date is invalid', () => {
      const rawData = {
        someDate: '43/03/2019',
        somethingElse: '19/03/2019',
      }
      const formFieldsConfig = [
        { someDate: { splitDate: { day: 'someDay', month: 'someMonth', year: 'someYear' } } },
        { somethingElse: {} },
      ]

      expect(service.addSplitDateFields(rawData, formFieldsConfig)).to.eql({
        someDate: '43/03/2019',
        somethingElse: '19/03/2019',
      })
    })

    it('should return as is if date field is missing', () => {
      const rawData = {
        somethingElse: '19/03/2019',
      }
      const formFieldsConfig = [
        { someDate: { splitDate: { day: 'someDay', month: 'someMonth', year: 'someYear' } } },
        { somethingElse: {} },
      ]

      expect(service.addSplitDateFields(rawData, formFieldsConfig)).to.eql({
        somethingElse: '19/03/2019',
      })
    })

    it('should return as is if no splitDate config', () => {
      const rawData = {
        someDate: '43/03/2019',
        somethingElse: '19/03/2019',
      }
      const formFieldsConfig = [{ someDate: {} }, { somethingElse: {} }]

      expect(service.addSplitDateFields(rawData, formFieldsConfig)).to.eql({
        someDate: '43/03/2019',
        somethingElse: '19/03/2019',
      })
    })
  })

  describe('update', () => {
    const bookingId = 'ab1'

    const baseLicence = {
      section1: '',
      section2: '',
      section3: {},
      section4: {
        form1: {},
        form2: { answer: 'answer' },
      },
    }

    context('When there are dependents', () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
          form3: {
            decision: '',
            followUp1: '',
            followUp2: '',
          },
        },
      }

      const fieldMap = [
        { decision: {} },
        {
          followUp1: {
            dependentOn: 'decision',
            predicate: 'Yes',
          },
        },
        {
          followUp2: {
            dependentOn: 'decision',
            predicate: 'Yes',
          },
        },
      ]

      it('should store dependents if predicate matches', async () => {
        const userInput = {
          decision: 'Yes',
          followUp1: 'County',
          followUp2: 'Town',
        }

        const licenceSection = 'section4'
        const formName = 'form3'

        const originalLicence = { booking_id: bookingId, licence }
        const output = await service.update({
          bookingId,
          originalLicence,
          config: { fields: fieldMap },
          userInput,
          licenceSection,
          formName,
        })

        expect(output).to.eql({
          ...licence,
          section4: {
            ...licence.section4,
            form3: {
              decision: 'Yes',
              followUp1: 'County',
              followUp2: 'Town',
            },
          },
        })
      })

      it('should remove dependents if predicate does not match', async () => {
        const userInput = {
          decision: 'No',
          followUp1: 'County',
          followUp2: 'Town',
        }

        const licenceSection = 'section4'
        const formName = 'form3'

        const originalLicence = { booking_id: bookingId, licence }
        const output = await service.update({
          bookingId,
          originalLicence,
          config: { fields: fieldMap },
          userInput,
          licenceSection,
          formName,
        })

        expect(output).to.eql({
          ...licence,
          section4: {
            ...licence.section4,
            form3: {
              decision: 'No',
            },
          },
        })
      })
    })

    context('When there are no dependents', () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
          form3: {
            decision: '',
            followUp1: '',
            followUp2: '',
          },
        },
      }

      const fieldMap = [{ decision: {} }, { followUp1: {} }, { followUp2: {} }]

      it('should store everything', async () => {
        const userInput = {
          decision: 'Yes',
          followUp1: 'County',
          followUp2: 'Town',
        }

        const licenceSection = 'section4'
        const formName = 'form3'

        const originalLicence = { booking_id: bookingId, licence }
        const output = await service.update({
          bookingId,
          originalLicence,
          config: { fields: fieldMap },
          userInput,
          licenceSection,
          formName,
        })

        expect(output).to.eql({
          ...licence,
          section4: {
            ...licence.section4,
            form3: {
              decision: 'Yes',
              followUp1: 'County',
              followUp2: 'Town',
            },
          },
        })
      })
    })
    it('should call updateLicence and pass in the licence', async () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
          form3: {
            decision: '',
            followUp1: '',
            followUp2: '',
          },
        },
      }

      const fieldMap = [{ decision: {} }, { followUp1: {} }, { followUp2: {} }]

      const userInput = {
        decision: 'Yes',
        followUp1: 'County',
        followUp2: 'Town',
      }

      const licenceSection = 'section4'
      const formName = 'form3'

      const originalLicence = { booking_id: bookingId, licence }
      await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
        postRelease: true,
      })

      const expectedLicence = {
        ...licence,
        section4: {
          ...licence.section4,
          form3: {
            decision: 'Yes',
            followUp1: 'County',
            followUp2: 'Town',
          },
        },
      }
      expect(licenceClient.updateLicence).to.be.calledOnce()
      expect(licenceClient.updateLicence).to.be.calledWith('ab1', expectedLicence, true)
    })

    it('should not call updateLicence if there are no changes', async () => {
      const fieldMap = [{ answer: {} }]
      const userInput = { answer: 'answer' }
      const licenceSection = 'section4'
      const formName = 'form2'

      const originalLicence = { booking_id: bookingId, licence: baseLicence }
      const output = await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
      })

      expect(licenceClient.updateLicence).to.not.be.called()
      expect(output).to.be.eql(baseLicence)
    })

    it('should add new form to the licence', async () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
        },
      }

      const fieldMap = [{ decision: {} }, { followUp1: {} }, { followUp2: {} }]

      const userInput = {
        decision: 'Yes',
        followUp1: 'County',
        followUp2: 'Town',
      }

      const licenceSection = 'section4'
      const formName = 'form3'

      const originalLicence = { booking_id: bookingId, licence }
      const output = await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
      })

      const expectedLicence = {
        ...licence,
        section4: {
          ...licence.section4,
          form3: {
            decision: 'Yes',
            followUp1: 'County',
            followUp2: 'Town',
          },
        },
      }
      expect(output).to.eql(expectedLicence)
    })

    it('should add new section to the licence', async () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
        },
      }

      const fieldMap = [{ decision: {} }, { followUp1: {} }, { followUp2: {} }]

      const userInput = {
        decision: 'Yes',
        followUp1: 'County',
        followUp2: 'Town',
      }

      const licenceSection = 'section5'
      const formName = 'form3'

      const originalLicence = { booking_id: bookingId, licence }
      const output = await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
      })

      const expectedLicence = {
        ...licence,
        section5: {
          form3: {
            decision: 'Yes',
            followUp1: 'County',
            followUp2: 'Town',
          },
        },
      }
      expect(output).to.eql(expectedLicence)
    })

    it('should recurse if a field has inner contents', async () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
        },
      }

      const fieldMap = [
        { decision: {} },
        {
          outer: {
            contains: [
              { innerQuestion: {} },
              { innerQuestion2: {} },
              { dependentAnswer: { dependentOn: 'innerQuestion2', predicate: 'Yes' } },
              {
                innerOuter: {
                  contains: [{ innerInner: {} }],
                },
              },
            ],
          },
        },
        { followUp2: {} },
      ]

      const userInput = {
        decision: 'Yes',
        outer: {
          innerQuestion: 'InnerAnswer',
          innerQuestion2: 'Yes',
          unwantedAnswer: 'unwanted',
          dependentAnswer: 'depAnswer',
          innerOuter: {
            innerInner: 'here',
            innerUnwanted: 'here2',
          },
        },
        followUp2: 'Town',
      }

      const licenceSection = 'section5'
      const formName = 'form3'

      const originalLicence = { booking_id: bookingId, licence }
      const output = await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
      })

      const expectedLicence = {
        ...licence,
        section5: {
          form3: {
            decision: 'Yes',
            outer: {
              innerQuestion: 'InnerAnswer',
              innerQuestion2: 'Yes',
              dependentAnswer: 'depAnswer',
              innerOuter: {
                innerInner: 'here',
              },
            },
            followUp2: 'Town',
          },
        },
      }
      expect(output).to.eql(expectedLicence)
    })

    it('should recurse through list items', async () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
        },
      }

      const fieldMap = [
        { decision: {} },
        {
          innerObject: {
            isList: true,
            contains: [
              { innerQuestion: {} },
              { innerQuestion2: {} },
              { dependentAnswer: { dependentOn: 'innerQuestion2', predicate: 'Yes' } },
            ],
          },
        },
        { followUp2: {} },
      ]

      const userInput = {
        decision: 'Yes',
        innerObject: [
          {
            innerQuestion: 'InnerAnswer',
            innerQuestion2: 'No',
          },
          {
            innerQuestion: 'InnerAnswer',
            innerQuestion2: 'Yes',
            unwantedAnswer: 'unwanted',
            dependentAnswer: 'depAnswer',
          },
        ],
        followUp2: 'Town',
      }

      const licenceSection = 'section5'
      const formName = 'form3'

      const originalLicence = { booking_id: bookingId, licence }
      const output = await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
      })

      const expectedLicence = {
        ...licence,
        section5: {
          form3: {
            decision: 'Yes',
            innerObject: [
              {
                innerQuestion: 'InnerAnswer',
                innerQuestion2: 'No',
              },
              {
                innerQuestion: 'InnerAnswer',
                innerQuestion2: 'Yes',
                dependentAnswer: 'depAnswer',
              },
            ],
            followUp2: 'Town',
          },
        },
      }
      expect(output).to.eql(expectedLicence)
    })

    it('should filter out empty list items', async () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
        },
      }

      const fieldMap = [
        { decision: {} },
        {
          innerObject: {
            isList: true,
            contains: [{ innerQuestion: {} }, { innerQuestion2: {} }],
          },
        },
        { followUp2: {} },
      ]

      const userInput = {
        decision: 'Yes',
        innerObject: [
          {
            innerQuestion: 'InnerAnswer',
            innerQuestion2: 'No',
          },
          {
            innerQuestion: 'InnerAnswer2',
            innerQuestion2: 'Yes',
          },
          {
            innerQuestion: '',
            innerQuestion2: '',
          },
        ],
        followUp2: 'Town',
      }

      const licenceSection = 'section5'
      const formName = 'form3'

      const originalLicence = { booking_id: bookingId, licence }
      const output = await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
      })

      const expectedLicence = {
        ...licence,
        section5: {
          form3: {
            decision: 'Yes',
            innerObject: [
              {
                innerQuestion: 'InnerAnswer',
                innerQuestion2: 'No',
              },
              {
                innerQuestion: 'InnerAnswer2',
                innerQuestion2: 'Yes',
              },
            ],
            followUp2: 'Town',
          },
        },
      }
      expect(output).to.eql(expectedLicence)
    })

    it('should filter out empty list items with recursion', async () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
        },
      }

      const fieldMap = [
        { decision: {} },
        {
          listItem: {
            isList: true,
            contains: [
              { innerQuestion: {} },
              {
                innerQuestion2: {
                  contains: [{ innerInner: {} }],
                },
              },
            ],
          },
        },
        { followUp2: {} },
      ]

      const userInput = {
        decision: 'Yes',
        listItem: [
          {
            innerQuestion: 'InnerAnswer',
            innerQuestion2: {
              innerInner: 'innerInner',
            },
          },
          {
            innerQuestion: 'InnerAnswer2',
            innerQuestion2: {
              innerInner: 'innerInner',
            },
          },
          {
            innerQuestion: '',
            innerQuestion2: {
              innerInner: '',
            },
          },
        ],
        followUp2: 'Town',
      }

      const licenceSection = 'section5'
      const formName = 'form3'

      const originalLicence = { booking_id: bookingId, licence }
      const output = await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
      })

      const expectedLicence = {
        ...licence,
        section5: {
          form3: {
            decision: 'Yes',
            listItem: [
              {
                innerQuestion: 'InnerAnswer',
                innerQuestion2: {
                  innerInner: 'innerInner',
                },
              },
              {
                innerQuestion: 'InnerAnswer2',
                innerQuestion2: {
                  innerInner: 'innerInner',
                },
              },
            ],
            followUp2: 'Town',
          },
        },
      }
      expect(output).to.eql(expectedLicence)
    })

    it('should piece together split dates', async () => {
      const fieldMap = [{ someDate: { splitDate: { day: 'someDay', month: 'someMonth', year: 'someYear' } } }]

      const userInput = {
        someDay: '12',
        someMonth: '03',
        someYear: '1985',
      }

      const licenceSection = 'section5'
      const formName = 'form3'

      const originalLicence = { booking_id: bookingId, licence: baseLicence }
      const output = await service.update({
        bookingId,
        originalLicence,
        config: { fields: fieldMap },
        userInput,
        licenceSection,
        formName,
      })

      const expectedLicence = {
        ...baseLicence,
        section5: {
          form3: {
            someDate: '12/03/1985',
          },
        },
      }
      expect(output).to.eql(expectedLicence)
    })

    context('modificationRequiresApproval', () => {
      const licence = {
        ...baseLicence,
        section4: {
          ...baseLicence.section4,
          form3: {
            decision: '',
          },
        },
      }

      const fieldMap = [{ decision: {} }]

      const licenceSection = 'section4'
      const formName = 'form3'
      const userInput = {
        decision: 'Yes',
      }

      it('should update stage to MODIFIED if modificationRequiresApproval = true is not in config', async () => {
        const originalLicence = { booking_id: bookingId, stage: 'DECIDED', licence }
        await service.update({
          bookingId,
          originalLicence,
          config: { fields: fieldMap },
          userInput,
          licenceSection,
          formName,
        })

        expect(licenceClient.updateStage).to.be.calledOnce()
        expect(licenceClient.updateStage).to.be.calledWith(bookingId, 'MODIFIED')
      })

      it('should not update stage to MODIFIED if noModify is set in config', async () => {
        const originalLicence = { booking_id: bookingId, stage: 'DECIDED', licence }
        const config = {
          fields: fieldMap,
          noModify: true,
        }
        await service.update({ bookingId, originalLicence, config, userInput, licenceSection, formName })

        expect(licenceClient.updateStage).to.not.be.called()
      })

      it('should not update stage to MODIFIED if in MODIFIED_APPROVAL', async () => {
        const originalLicence = { booking_id: bookingId, stage: 'MODIFIED_APPROVAL', licence }
        await service.update({
          bookingId,
          originalLicence,
          config: { fields: fieldMap },
          userInput,
          licenceSection,
          formName,
        })

        expect(licenceClient.updateStage).to.not.be.calledOnce()
      })

      it('should not update stage if in config', async () => {
        const originalLicence = { booking_id: bookingId, stage: 'DECIDED', licence }
        const config = {
          fields: fieldMap,
          modificationRequiresApproval: true,
        }
        await service.update({ bookingId, originalLicence, config, userInput, licenceSection, formName })

        expect(licenceClient.updateStage).to.be.calledOnce()
        expect(licenceClient.updateStage).to.be.calledWith(bookingId, 'MODIFIED_APPROVAL')
      })

      it('should not update stage if no change', async () => {
        const originalLicence = { booking_id: bookingId, stage: 'DECIDED', licence }
        const config = {
          fields: fieldMap,
          modificationRequiresApproval: true,
        }
        const bespokeUserInput = {
          decision: '',
        }
        await service.update({
          bookingId,
          originalLicence,
          config,
          userInput: bespokeUserInput,
          licenceSection,
          formName,
        })

        expect(licenceClient.updateStage).to.not.be.calledOnce()
      })

      it('should not update stage if not in DECIDED state', async () => {
        const originalLicence = { booking_id: bookingId, stage: 'PROCESSING_RO', licence }
        const config = {
          fields: fieldMap,
          modificationRequiresApproval: true,
        }
        const bespokeUserInput = {
          decision: '',
        }
        await service.update({
          bookingId,
          originalLicence,
          config,
          userInput: bespokeUserInput,
          licenceSection,
          formName,
        })

        expect(licenceClient.updateStage).to.not.be.calledOnce()
      })
    })
  })

  describe('rejectBass', () => {
    const bassRequest = {
      bassRequested: 1,
      proposedTown: 1,
      proposedCounty: 1,
    }

    const bassAreaCheck = {
      bassAreaSuitable: 'No',
      bassAreaReason: '1',
    }

    const baseLicence = {
      stage: 'ELIGIBILITY',
      licence: {
        bassReferral: {
          bassRequest,
          bassAreaCheck,
        },
      },
    }

    it('should move bassReferral into a rejection list', async () => {
      await service.rejectBass(baseLicence.licence, 123, 'Yes', 'Reason')

      const expectedOutput = {
        bassReferral: {
          bassRequest: {
            bassRequested: 'Yes',
          },
        },
        bassRejections: [
          {
            bassRequest,
            bassAreaCheck,
            rejectionReason: 'Reason',
          },
        ],
      }

      expect(licenceClient.updateLicence).to.be.calledWith(123, expectedOutput)
    })

    it('should set bassReferral to empty with bassRequested value', async () => {
      await service.rejectBass(baseLicence.licence, 123, 'value to set', 'Reason')

      const expectedOutput = {
        bassReferral: {
          bassRequest: {
            bassRequested: 'value to set',
          },
        },
        bassRejections: [
          {
            bassRequest,
            bassAreaCheck,
            rejectionReason: 'Reason',
          },
        ],
      }

      expect(licenceClient.updateLicence).to.be.calledWith(123, expectedOutput)
    })

    it('should move bassReferral to the end of existing rejection list', async () => {
      const bespokeLicence = {
        stage: 'ELIGIBILITY',
        licence: {
          bassReferral: {
            bassRequest,
            bassAreaCheck,
          },
          bassRejections: [{ first: 'rejection' }],
        },
      }

      await service.rejectBass(bespokeLicence.licence, 123, 'Yes', 'Reason')

      const expectedOutput = {
        bassReferral: {
          bassRequest: {
            bassRequested: 'Yes',
          },
        },
        bassRejections: [
          { first: 'rejection' },
          {
            bassRequest,
            bassAreaCheck,
            rejectionReason: 'Reason',
          },
        ],
      }

      expect(licenceClient.updateLicence).to.be.calledWith(123, expectedOutput)
    })

    it('should not update the saved licence if there is no bassReferral to reject', async () => {
      const licence = {}

      await service.rejectBass(licence, 123, 'Yes', 'Reason')

      expect(licenceClient.updateLicence).to.not.be.called()
    })
  })

  describe('withdrawBass', () => {
    const bassRequest = {
      bassRequested: 1,
      proposedTown: 1,
      proposedCounty: 1,
    }

    const bassAreaCheck = {
      bassAreaSuitable: 'No',
      bassAreaReason: '1',
    }

    const baseLicence = {
      stage: 'ELIGIBILITY',
      licence: {
        bassReferral: {
          bassRequest,
          bassAreaCheck,
        },
      },
    }

    it('should mark bassReferral as withdrawn and move into a rejection list', async () => {
      await service.withdrawBass(baseLicence.licence, 123, 'type of withdraw')

      const expectedOutput = {
        bassReferral: {
          bassRequest: {
            bassRequested: 'Yes',
          },
        },
        bassRejections: [
          {
            bassRequest,
            bassAreaCheck,
            withdrawal: 'type of withdraw',
          },
        ],
      }

      expect(licenceClient.updateLicence).to.be.calledWith(123, expectedOutput)
    })

    it('should set bassReferral to requested = yes', async () => {
      service.withdrawBass(baseLicence.licence, 123, 'type of withdraw')

      const expectedOutput = {
        bassReferral: {
          bassRequest: {
            bassRequested: 'Yes',
          },
        },
        bassRejections: [
          {
            bassRequest,
            bassAreaCheck,
            withdrawal: 'type of withdraw',
          },
        ],
      }

      expect(licenceClient.updateLicence).to.be.calledWith(123, expectedOutput)
    })

    it('should move bassWithdrawal to the end of existing rejection list', async () => {
      const currentLicence = {
        stage: 'ELIGIBILITY',
        licence: {
          bassReferral: {
            bassRequest,
            bassAreaCheck,
          },
          bassRejections: [{ first: 'rejection' }],
        },
      }

      service.withdrawBass(currentLicence.licence, 123, 'type of withdraw')

      const expectedOutput = {
        bassReferral: {
          bassRequest: {
            bassRequested: 'Yes',
          },
        },
        bassRejections: [
          { first: 'rejection' },
          {
            bassRequest,
            bassAreaCheck,
            withdrawal: 'type of withdraw',
          },
        ],
      }

      expect(licenceClient.updateLicence).to.be.calledWith(123, expectedOutput)
    })

    it('should not update the saved licence if there is no bassReferral to withdraw', async () => {
      const licence = {}

      const output = await service.withdrawBass(licence, 123, 'type of withdraw')

      expect(licenceClient.updateLicence).to.not.be.called()
      expect(output).to.eql(licence)
    })
  })

  describe('reinstateBass', () => {
    const bassRequest = {
      bassRequested: 1,
      proposedTown: 1,
      proposedCounty: 1,
    }

    const bassAreaCheck = {
      bassAreaSuitable: 'No',
      bassAreaReason: '1',
    }

    const baseLicence = {
      stage: 'ELIGIBILITY',
      licence: {
        bassReferral: {
          bassRequest: {
            something: 'else',
          },
        },
        bassRejections: [
          {
            other: 'record',
          },
          {
            withdrawal: 'reason',
            bassRequest,
            bassAreaCheck,
          },
        ],
      },
    }

    it('should remove last entry from bassRejectons and restore to bassReferral, without the withdrawal field', async () => {
      await service.reinstateBass(baseLicence.licence, 123)

      const expectedOutput = {
        bassReferral: {
          bassRequest,
          bassAreaCheck,
        },
        bassRejections: [
          {
            other: 'record',
          },
        ],
      }

      expect(licenceClient.updateLicence).to.be.calledWith(123, expectedOutput)
    })

    it('should error when no rejections to reinstate', async () => {
      const noRejections = {
        stage: 'ELIGIBILITY',
        licence: {
          bassReferral: {},
          bassRejections: [],
        },
      }

      expect(() => service.reinstateBass(noRejections.licence, 123)).to.throw(Error)
    })
  })

  describe('reject and reinstate address', async () => {
    describe('when risk exists on licence', () => {
      const licence = {
        proposedAddress: {
          curfewAddress: { key: 'value' },
          rejections: [],
        },
        curfew: {
          curfewAddressReview: { rev: 'iew' },
          somethingUninteresting: 'boring',
        },
        risk: {
          riskManagement: {
            planningActions: 'Yes',
            proposedAddressSuitable: 'No',
            unsuitableReason: 'Reasons',
          },
        },
      }

      const rejectedAddressLicence = {
        proposedAddress: {
          rejections: [
            {
              address: {
                key: 'value',
              },
              addressReview: {
                curfewAddressReview: { rev: 'iew' },
              },
              riskManagement: {
                proposedAddressSuitable: 'No',
                unsuitableReason: 'Reasons',
              },
              withdrawalReason: 'consentWithdrawn',
            },
          ],
        },
        curfew: {
          somethingUninteresting: 'boring',
        },
        risk: {
          riskManagement: {
            planningActions: 'Yes',
          },
        },
      }

      describe('reject', () => {
        it('should add proposed address and review to the rejected list', () => {
          service.rejectProposedAddress(licence, '001', 'consentWithdrawn')
          expect(licenceClient.updateLicence).to.be.calledOnce()
          expect(licenceClient.updateLicence).to.be.calledWith('001', rejectedAddressLicence)
        })
      })

      describe('reinstate', () => {
        it('should remove from the rejected list and replace in licence structure', async () => {
          const output = await service.reinstateProposedAddress(rejectedAddressLicence, '001')
          expect(licenceClient.updateLicence).to.be.calledOnce()
          expect(output).to.eql(licence)
        })
      })

      describe('no curfew', () => {
        const licenceNoCurfew = {
          proposedAddress: {
            curfewAddress: { key: 'value' },
            rejections: [],
          },
          risk: {
            riskManagement: {
              planningActions: 'Yes',
              proposedAddressSuitable: 'No',
              unsuitableReason: 'Reasons',
            },
          },
        }

        const rejectedAddressLicenceNoCurfew = {
          proposedAddress: {
            rejections: [
              {
                address: {
                  key: 'value',
                },
                riskManagement: {
                  proposedAddressSuitable: 'No',
                  unsuitableReason: 'Reasons',
                },
                withdrawalReason: 'consentWithdrawn',
              },
            ],
          },
          risk: {
            riskManagement: {
              planningActions: 'Yes',
            },
          },
        }

        it('should add proposed address and review to the rejected list', () => {
          service.rejectProposedAddress(licenceNoCurfew, '001', 'consentWithdrawn')
          expect(licenceClient.updateLicence).to.be.calledOnce()
          expect(licenceClient.updateLicence).to.be.calledWith('001', rejectedAddressLicenceNoCurfew)
        })

        it('should remove from the rejected list and replace in licence structure', async () => {
          const output = await service.reinstateProposedAddress(rejectedAddressLicenceNoCurfew, '001')
          expect(licenceClient.updateLicence).to.be.calledOnce()
          expect(output).to.eql(licenceNoCurfew)
        })
      })
    })

    describe('when risk does not exist on licence', () => {
      const licence = {
        proposedAddress: {
          curfewAddress: { key: 'value' },
          rejections: [],
        },
        curfew: {
          curfewAddressReview: { rev: 'iew' },
          somethingUninteresting: 'boring',
        },
      }

      const rejectedAddressLicence = {
        proposedAddress: {
          rejections: [
            {
              address: {
                key: 'value',
              },
              addressReview: {
                curfewAddressReview: { rev: 'iew' },
              },
              withdrawalReason: 'consentWithdrawn',
            },
          ],
        },
        curfew: {
          somethingUninteresting: 'boring',
        },
      }

      describe('reject', () => {
        it('should handle risk management not being completed', async () => {
          const output = await service.rejectProposedAddress(licence, '001', 'consentWithdrawn')
          expect(licenceClient.updateLicence).to.be.calledOnce()
          expect(output).to.eql(rejectedAddressLicence)
        })
      })

      describe('reinstate', () => {
        it('should remove from the rejected list and replace in licence structure', async () => {
          const output = await service.reinstateProposedAddress(rejectedAddressLicence, '001')
          expect(licenceClient.updateLicence).to.be.calledOnce()
          expect(output).to.eql(licence)
        })
      })
    })
  })

  describe('validateFormGroup', () => {
    let validateGroupStub

    const licenceServiceProxy = (validateGroup = validateGroupStub) => {
      return proxyquire('../../server/services/licenceService', {
        './utils/formValidation': {
          validateGroup,
        },
      })
    }

    beforeEach(() => {
      validateGroupStub = sinon.stub().resolves({})
      service = licenceServiceProxy()(licenceClient)
    })

    it('should use correct group when bassReferralNeeded', () => {
      const decisions = {
        bassReferralNeeded: true,
        offenderIsMainOccupier: true,
      }

      service.validateFormGroup({ licence: {}, stage: 'ELIGIBILITY', decisions, tasks: {} })

      expect(validateGroupStub).to.be.calledOnce()
      expect(validateGroupStub).to.be.calledWith({
        licence: {},
        group: 'BASS_REQUEST',
        bespokeConditions: { offenderIsMainOccupier: true },
      })
    })

    it('should use correct group when approvedPremisesRequired', () => {
      const decisions = {
        approvedPremisesRequired: true,
      }

      service.validateFormGroup({ licence: {}, stage: 'PROCESSING_RO', decisions, tasks: {} })

      expect(validateGroupStub).to.be.calledOnce()
      expect(validateGroupStub).to.be.calledWith({
        licence: {},
        group: 'PROCESSING_RO_APPROVED_PREMISES',
        bespokeConditions: { offenderIsMainOccupier: undefined },
      })
    })
    it('should use correct group when new address for review', () => {
      service.validateFormGroup({
        licence: {},
        stage: 'ELIGIBILITY',
        decisions: {},
        tasks: { curfewAddressReview: 'UNSTARTED' },
      })

      expect(validateGroupStub).to.be.calledOnce()
      expect(validateGroupStub).to.be.calledWith({
        licence: {},
        group: 'ELIGIBILITY',
        bespokeConditions: { offenderIsMainOccupier: undefined },
      })
    })
  })

  describe('createLicenceFromFlatInput', () => {
    it('should save the curfew address, reporting address and conditions answer as a licence structure', async () => {
      const details = {
        addressLine1: 'ad1',
        addressLine2: 'ad2',
        addressTown: 'town',
        postCode: 'pc',
        telephone: 'phone',
        reportingAddressLine1: 'rad1',
        reportingAddressLine2: 'rad2',
        reportingAddressTown: 'rtown',
        reportingPostCode: 'rpc',
        reportingTelephone: 'rphone',
        reportingContact: 'rcont',
        additionalConditions: 'y',
      }

      const expectedOutput = {
        proposedAddress: {
          curfewAddress: {
            addressLine1: 'ad1',
            addressLine2: 'ad2',
            addressTown: 'town',
            postCode: 'pc',
            telephone: 'phone',
          },
        },
        reporting: {
          reportingInstructions: {
            name: 'rcont',
            postcode: 'rpc',
            telephone: 'rphone',
            townOrCity: 'rtown',
            buildingAndStreet1: 'rad1',
            buildingAndStreet2: 'rad2',
          },
        },
        licenceConditions: {
          standard: {
            additionalConditionsRequired: 'y',
          },
        },
      }

      await service.createLicenceFromFlatInput(details, 'a', { a: 'b' }, varyConfig.licenceDetails, false)
      expect(licenceClient.updateLicence).to.be.calledOnce()
      expect(licenceClient.updateLicence).to.be.calledWith('a', { ...expectedOutput, a: 'b' }, false)
    })

    it('should transform the curfew hours into a licence structure if daySpecificInputs === No', () => {
      const input = {
        allFrom: '19:00',
        allUntil: '07:00',
        mondayFrom: 'gg',
        mondayUntil: 'h',
        tuesdayFrom: 'w',
        tuesdayUntil: 'jyr',
        wednesdayFrom: 'jy',
        wednesdayUntil: 'jsjy',
        thursdayFrom: 's',
        thursdayUntil: 'jryj',
        fridayFrom: 'h',
        fridayUntil: 'jrs',
        saturdayFrom: 'r',
        saturdayUntil: 'jk',
        sundayFrom: 'kt',
        sundayUntil: 'jy',
        daySpecificInputs: 'No',
      }

      const output = {
        curfew: {
          curfewHours: {
            allFrom: '19:00',
            allUntil: '07:00',
            fridayFrom: '19:00',
            mondayFrom: '19:00',
            sundayFrom: '19:00',
            fridayUntil: '07:00',
            mondayUntil: '07:00',
            sundayUntil: '07:00',
            tuesdayFrom: '19:00',
            saturdayFrom: '19:00',
            thursdayFrom: '19:00',
            tuesdayUntil: '07:00',
            saturdayUntil: '07:00',
            thursdayUntil: '07:00',
            wednesdayFrom: '19:00',
            wednesdayUntil: '07:00',
            daySpecificInputs: 'No',
          },
        },
      }

      return expect(service.createLicenceFromFlatInput(input, '1', {}, varyConfig.licenceDetails)).to.eventually.eql(
        output
      )
    })

    it('should transform the curfew hours into a licence structure if daySpecificInputs === Yes', () => {
      const input = {
        allFrom: '19:00',
        allUntil: '07:00',
        mondayFrom: 'gg',
        mondayUntil: 'h',
        tuesdayFrom: 'w',
        tuesdayUntil: 'jyr',
        wednesdayFrom: 'jy',
        wednesdayUntil: 'jsjy',
        thursdayFrom: 's',
        thursdayUntil: 'jryj',
        fridayFrom: 'h',
        fridayUntil: 'jrs',
        saturdayFrom: 'r',
        saturdayUntil: 'jk',
        sundayFrom: 'kt',
        sundayUntil: 'jy',
        daySpecificInputs: 'Yes',
      }

      const output = {
        curfew: {
          curfewHours: {
            allFrom: '19:00',
            allUntil: '07:00',
            mondayFrom: 'gg',
            mondayUntil: 'h',
            tuesdayFrom: 'w',
            tuesdayUntil: 'jyr',
            wednesdayFrom: 'jy',
            wednesdayUntil: 'jsjy',
            thursdayFrom: 's',
            thursdayUntil: 'jryj',
            fridayFrom: 'h',
            fridayUntil: 'jrs',
            saturdayFrom: 'r',
            saturdayUntil: 'jk',
            sundayFrom: 'kt',
            sundayUntil: 'jy',
            daySpecificInputs: 'Yes',
          },
        },
      }

      return expect(service.createLicenceFromFlatInput(input, '1', {}, varyConfig.licenceDetails)).to.eventually.eql(
        output
      )
    })
  })
})
