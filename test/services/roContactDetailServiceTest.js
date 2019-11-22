const createRoContactDetailsService = require('../../server/services/roContactDetailsService')

describe('roContactDetailsService', () => {
  let service
  let userAdminService

  beforeEach(() => {
    userAdminService = {
      getRoUserByDeliusId: sinon.stub(),
    }

    service = createRoContactDetailsService(userAdminService)
  })

  describe('getContactDetails', () => {
    it('successfully return all data', async () => {
      const fullContactInfo = {
        email: 'ro@ro.email',
        orgEmail: 'admin@ro.email',
        organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
      }

      userAdminService.getRoUserByDeliusId = sinon.stub().resolves(fullContactInfo)

      const result = await service.getContactDetails('delius-1')

      expect(result).to.eql(fullContactInfo)
      expect(userAdminService.getRoUserByDeliusId).to.be.calledWith('delius-1')
    })

    it('no staff record', async () => {
      userAdminService.getRoUserByDeliusId = sinon.stub().resolves(null)

      const result = await service.getContactDetails('delius-1')

      expect(result).to.eql(null)
      expect(userAdminService.getRoUserByDeliusId).to.be.calledWith('delius-1')
    })
  })
})
