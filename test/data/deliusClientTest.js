const nock = require('nock')

const config = require('../../server/config')
const createDeliusClient = require('../../server/data/deliusClient')

describe('deliusClient', () => {
  let fakeDelius
  let deliusClient
  let signInService

  beforeEach(() => {
    fakeDelius = nock(`${config.delius.apiUrl}${config.delius.apiPrefix}`)
    signInService = {
      getAnonymousClientCredentialsTokens: sinon.stub().resolves('token'),
    }
    deliusClient = createDeliusClient(signInService)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('deliusClient', () => {
    it('should throw error on GET when no token', () => {
      signInService.getAnonymousClientCredentialsTokens.resolves(null)
      return expect(deliusClient.getROPrisoners('1')).to.be.rejectedWith('Unauthorised access')
    })
  })

  describe('getStaffByStaffCode', () => {
    it('should return data from api', () => {
      fakeDelius.get(`/staff/staffCode/1`).reply(200, { key: 'value' })

      return expect(deliusClient.getStaffDetailsByStaffCode('1')).to.eventually.eql({ key: 'value' })
    })

    it('should reject if api fails', () => {
      fakeDelius.get(`/staff/staffCode/1`).reply(500)

      return expect(deliusClient.getStaffDetailsByStaffCode('1')).to.be.rejected()
    })
  })

  describe('getStaffByUsername', () => {
    it('should return data from api', () => {
      fakeDelius.get(`/staff/username/1`).reply(200, { key: 'value' })

      return expect(deliusClient.getStaffDetailsByUsername('1')).to.eventually.eql({ key: 'value' })
    })

    it('should reject if api fails', () => {
      fakeDelius.get(`/staff/staffCode/1`).reply(500)

      return expect(deliusClient.getStaffDetailsByUsername('1')).to.be.rejected()
    })
  })

  describe('getROPrisoners', () => {
    it('should return data from api', () => {
      fakeDelius.get(`/staff/staffCode/1/managedOffenders`).reply(200, { key: 'value' })

      return expect(deliusClient.getROPrisoners('1')).to.eventually.eql({ key: 'value' })
    })

    it('should reject if api fails', () => {
      fakeDelius.get(`/staff/staffCode/1/managedOffenders`).reply(500)

      return expect(deliusClient.getROPrisoners('1')).to.be.rejected()
    })
  })

  describe('getResponsibleOfficer', () => {
    it('should return data from api', () => {
      fakeDelius.get(`/offenders/nomsNumber/1/responsibleOfficers`).reply(200, { key: 'value' })

      return expect(deliusClient.getResponsibleOfficer('1')).to.eventually.eql({ key: 'value' })
    })

    it('should reject if api fails', () => {
      fakeDelius.get(`/offenders/nomsNumber/1/responsibleOfficers`).reply(500)

      return expect(deliusClient.getResponsibleOfficer('1')).to.be.rejected()
    })
  })
})
