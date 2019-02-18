const createConditionsService = require('../../server/services/conditionsService')
const { standardConditions } = require('../../server/services/config/conditionsConfig')
const {
    additionalConditionsObject,
    additionalConditionsObjectNoResideSelected,
    additionalConditionsObjectDateSelected,
} = require('../stubs/conditions')

describe('conditionsService', () => {
    let licenceClient
    let service

    beforeEach(() => {
        service = createConditionsService(licenceClient)
    })

    describe('getStandardConditions', () => {
        it('should return the conditions', () => {
            return expect(service.getStandardConditions()).to.eql(standardConditions)
        })
    })

    describe('getAdditionalConditions', () => {
        it('should split the conditions by group and subgroup', () => {
            return expect(service.getAdditionalConditions()).to.eql(additionalConditionsObject)
        })

        it('should populate inputs if licence is passed in', () => {
            const licence = {
                licenceConditions: {
                    additional: { NORESIDE: { notResideWithAge: 12, notResideWithGender: 'Female' } },
                },
            }

            return expect(service.getAdditionalConditions(licence)).to.eql(additionalConditionsObjectNoResideSelected)
        })

        it('should split the appointmentDate into day, month, year', () => {
            const licence = {
                licenceConditions: {
                    additional: { ATTENDDEPENDENCY: { appointmentDate: '12/03/1985' } },
                },
            }

            return expect(service.getAdditionalConditions(licence)).to.eql(additionalConditionsObjectDateSelected)
        })
    })

    describe('populateLicenceWithConditions', () => {
        it('should return the licence if conditions not required', () => {
            const licence = {
                licenceConditions: {
                    standard: { additionalConditionsRequired: 'No' },
                    additional: { 1: {} },
                    bespoke: [],
                },
            }

            return expect(service.populateLicenceWithConditions(licence)).to.eql(licence)
        })

        it('should return licence if no additional conditions', () => {
            const licence = { licenceConditions: {} }

            return expect(service.populateLicenceWithConditions(licence)).to.eql({
                licenceConditions: {},
            })
        })
    })
})
