const createRoContactDetailsService = require('../../server/services/roContactDetailsService')

describe('roContactDetailsService', () => {
  let service
  let userAdminService
  let roService

  beforeEach(() => {
    userAdminService = {
      getRoUserByDeliusId: sinon.stub(),
    }
    roService = {
      getStaffByCode: sinon.stub(),
      findResponsibleOfficerByBookingId: sinon.stub(),
    }

    service = createRoContactDetailsService(userAdminService, roService)
  })

  describe('getFunctionalMailBox', () => {
    it('successfully returns local data', async () => {
      const fullContactInfo = {
        email: 'ro@ro.email',
        orgEmail: 'admin@ro.email',
        organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
      }

      userAdminService.getRoUserByDeliusId = sinon.stub().resolves(fullContactInfo)

      const result = await service.getFunctionalMailBox('delius-1')

      expect(result).to.eql('admin@ro.email')
      expect(userAdminService.getRoUserByDeliusId).to.be.calledWith('delius-1')
      expect(roService.getStaffByCode).not.to.be.calledWith('delius-1')
    })

    it('local data not stored', async () => {
      userAdminService.getRoUserByDeliusId = sinon.stub().resolves(null)

      const result = await service.getFunctionalMailBox('delius-1')

      expect(result).to.eql(null)
      expect(userAdminService.getRoUserByDeliusId).to.be.calledWith('delius-1')
      expect(roService.getStaffByCode).not.to.be.calledWith('delius-1')
    })
  })

  describe('getResponsibleOfficerWithContactDetails', () => {
    it('successfully returns local data', async () => {
      const fullContactInfo = {
        email: 'ro@ro.email',
        orgEmail: 'admin@ro.email',
        organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
      }

      roService.findResponsibleOfficerByBookingId.resolves({ deliusId: 'delius-1' })

      userAdminService.getRoUserByDeliusId = sinon.stub().resolves(fullContactInfo)

      const result = await service.getResponsibleOfficerWithContactDetails(1, 'token-1')

      expect(result).to.eql({
        deliusId: 'delius-1',
        email: 'ro@ro.email',
        functionalMailbox: 'admin@ro.email',
        organisation: 'NPS Dewsbury (Kirklees and Wakefield)',
      })
      expect(userAdminService.getRoUserByDeliusId).to.be.calledWith('delius-1')
      expect(roService.getStaffByCode).not.to.be.calledWith('delius-1')
    })

    it('Fail to find responsible officer', async () => {
      roService.findResponsibleOfficerByBookingId.resolves({ message: 'could not find' })
      userAdminService.getRoUserByDeliusId = sinon.stub().resolves(null)

      const result = await service.getResponsibleOfficerWithContactDetails('delius-1')

      expect(result).to.eql({ message: 'could not find' })
      expect(userAdminService.getRoUserByDeliusId).not.to.be.called()
    })

    it('no staff record local, found in delius', async () => {
      roService.findResponsibleOfficerByBookingId.resolves({ deliusId: 'delius-1' })

      userAdminService.getRoUserByDeliusId.resolves(null)
      roService.getStaffByCode.resolves({ email: 'ro@ro.email.com', username: 'user-1' })

      const result = await service.getResponsibleOfficerWithContactDetails(1, 'token-1')

      expect(result).to.eql({
        deliusId: 'delius-1',
        email: 'ro@ro.email.com',
      })
      expect(userAdminService.getRoUserByDeliusId).to.be.calledWith('delius-1')
      expect(roService.getStaffByCode).to.be.calledWith('delius-1')
    })

    it('no staff record local, found in delius but not linked user', async () => {
      roService.findResponsibleOfficerByBookingId.resolves({ deliusId: 'delius-1' })

      userAdminService.getRoUserByDeliusId.resolves(null)
      roService.getStaffByCode.resolves({})

      const result = await service.getResponsibleOfficerWithContactDetails(1, 'token-1')

      expect(result).to.eql({
        message: 'Staff and user not linked in delius: delius-1',
      })
      expect(userAdminService.getRoUserByDeliusId).to.be.calledWith('delius-1')
      expect(roService.getStaffByCode).to.be.calledWith('delius-1')
    })
  })
})
