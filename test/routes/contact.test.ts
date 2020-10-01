import { mocked } from 'ts-jest/utils'
import request from 'supertest'
import { RoService } from '../../server/services/roService'
import { createSignInServiceStub } from '../mockServices'
import { startRoute } from '../supertestSetup'
import createContactRoute from '../../server/routes/contact'
import UserAdminService from '../../server/services/userAdminService'
import { RoUser } from '../../server/data/userClient'

jest.mock('../../server/services/roService')
jest.mock('../../server/services/userAdminService')

let app

describe('/contact', () => {
  let userAdminService: UserAdminService
  let roService: RoService
  let signInService

  beforeEach(() => {
    roService = new RoService(undefined, undefined)
    mocked(roService).findResponsibleOfficer.mockResolvedValue({
      deliusId: 'DELIUS_ID',
      staffIdentifier: 999,
      name: 'Ro Name',
      nomsNumber: undefined,
      teamCode: 'TEAM_CODE',
      teamDescription: 'The Team',
      lduCode: 'ABC123',
      lduDescription: 'LDU Description',
      probationAreaCode: 'PA_CODE',
      probationAreaDescription: 'PA Description',
      isAllocated: true,
    })
    mocked(roService).getStaffByStaffIdentifier.mockResolvedValue({
      username: 'username',
      email: '123456@somewhere.com',
      staffCode: 'DELIUS_ID',
      staffIdentifier: 999,
      staff: { forenames: 'RO', surname: 'Name' },
      teams: [
        {
          code: 'TEAM_CODE',
          description: 'The Team',
          telephone: '01234567890',
          localDeliveryUnit: { code: 'ABC123', description: 'LDU Description' },
          district: { code: 'D', description: 'District' },
          borough: { code: 'B', description: 'Borough' },
        },
      ],
    })

    userAdminService = new UserAdminService(undefined, undefined, undefined)

    signInService = createSignInServiceStub()

    app = startRoute(createContactRoute(userAdminService, roService, signInService), '/contact', 'caUser')
  })

  describe('GET /contact/:bookingId', () => {
    test('calls user service and returns html', () => {
      return request(app)
        .get('/contact/123456')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(() => {
          expect(roService.findResponsibleOfficer).toHaveBeenCalled()
          expect(roService.findResponsibleOfficer).toHaveBeenCalledWith('123456', 'system-token')
          expect(mocked(userAdminService).getRoUserByStaffIdentifier).toHaveBeenCalled()
          expect(mocked(userAdminService).getRoUserByStaffIdentifier).toHaveBeenCalledWith(999)
          expect(mocked(userAdminService).getFunctionalMailbox).toHaveBeenCalledWith('PA_CODE', 'ABC123', 'TEAM_CODE')
        })
    })

    test('should display RO details (from delius)', () => {
      mocked(userAdminService).getFunctionalMailbox.mockResolvedValue('abc@def.com')
      return request(app)
        .get('/contact/123456')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('ABC123')
          expect(res.text).toContain('LDU Description')
          expect(res.text).toContain('Ro Name')
          expect(res.text).toContain('DELIUS_ID')
          expect(res.text).toContain('999')
          expect(res.text).toContain('PA Description')
          expect(res.text).toContain('PA_CODE')
          expect(res.text).toContain('abc@def.com')
          expect(res.text).toContain('123456@somewhere.com')
        })
    })

    test('should display RO details (from local store)', () => {
      mocked(userAdminService).getRoUserByStaffIdentifier.mockResolvedValue({
        first: 'first',
        last: 'last',
        jobRole: 'JR',
        email: 'ro@email.com',
        telephone: '01234567890',
        organisation: 'The Org',
        orgEmail: 'org@email.com',
        staffIdentifier: 999,
      } as RoUser)

      return request(app)
        .get('/contact/123456')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('first last')
          expect(res.text).toContain('JR')
          expect(res.text).toContain('ro@email.com')
          expect(res.text).toContain('The Org')
          expect(res.text).toContain('org@email.com')

          expect(userAdminService.getRoUserByStaffIdentifier).toBeCalledWith(999)
          expect(userAdminService.getRoUserByDeliusUsername).not.toBeCalled()
        })
    })

    test('should display RO details, from local store, when mapped username in delius', () => {
      mocked(userAdminService).getRoUserByStaffIdentifier.mockResolvedValueOnce(null)

      mocked(userAdminService).getRoUserByDeliusUsername.mockResolvedValueOnce({
        first: 'first',
        last: 'last',
        jobRole: 'JR',
        email: 'ro@email.com',
        deliusUsername: 'DELIUS_USER',
        telephone: '01234567890',
        organisation: 'The Org',
        orgEmail: 'org@email.com',
      } as RoUser)

      return request(app)
        .get('/contact/123456')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('first last')
          expect(res.text).toContain('JR')
          expect(res.text).toContain('ro@email.com')
          expect(res.text).toContain('The Org')
          expect(res.text).toContain('org@email.com')

          expect(mocked(userAdminService).getRoUserByStaffIdentifier).toBeCalledWith(999)
          expect(mocked(userAdminService).getRoUserByDeliusUsername).toBeCalledWith('username')
        })
    })

    test('should handle absence of RO details (local and delius)', () => {
      mocked(roService).findResponsibleOfficer.mockResolvedValue({ message: 'message', code: 'ERROR_CODE' })

      return request(app)
        .get('/contact/123456')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('No contact details found')
        })
    })
  })
})
