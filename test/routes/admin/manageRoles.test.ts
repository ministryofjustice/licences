import request from 'supertest'
import { mockAudit } from '../../mockClients'
import { startRoute } from '../../supertestSetup'
import createManageRoles from '../../../server/routes/admin/manageRoles'
import config from '../../../server/config'

const {
  delius: { responsibleOfficerRoleId, responsibleOfficerVaryRoleId },
} = config

describe('/manage-roles', () => {
  let migrationService

  beforeEach(() => {
    migrationService = {
      getDeliusRoles: jest.fn(),
      addDeliusRole: jest.fn(),
    }
  })

  const createApp = (user, audit = mockAudit()) =>
    startRoute(createManageRoles(migrationService), '/admin/manage-roles', user, 'USER_MANAGEMENT', null, audit)

  describe('GET /admin/manage-roles', () => {
    test('calls user service and renders HTML output', () => {
      const app = createApp('batchUser')
      return request(app)
        .get('/admin/manage-roles')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('View roles for Delius username')
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/manage-roles').expect(403)
    })
  })

  describe('POST /', () => {
    test('calls user service and renders HTML output', () => {
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/manage-roles')
        .send({ deliusUsername: 'BOB' })
        .expect(302)
        .expect('Location', '/admin/manage-roles/BOB')
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).post('/admin/manage-roles').send({ deliusUsername: 'BOB' }).expect(403)
    })
  })

  describe('GET /admin/manage-roles/BOB', () => {
    test('Gathers roles and renders HTML output', () => {
      const app = createApp('batchUser')
      migrationService.getDeliusRoles.mockResolvedValue([responsibleOfficerRoleId, responsibleOfficerVaryRoleId])
      return request(app)
        .get('/admin/manage-roles/BOB')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Roles for username: BOB')
          expect(res.text).toContain('<td>RO</td>')
          expect(res.text).toContain('<td>VARY</td>')
        })
    })
    test('Gathers no roles and renders HTML output', () => {
      const app = createApp('batchUser')
      migrationService.getDeliusRoles.mockResolvedValue([])
      return request(app)
        .get('/admin/manage-roles/BOB')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('No delius roles present')
        })
    })

    test('When more roles can be added', () => {
      const app = createApp('batchUser')
      migrationService.getDeliusRoles.mockResolvedValue([responsibleOfficerRoleId])
      return request(app)
        .get('/admin/manage-roles/BOB')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('Roles for username: BOB')
          expect(res.text).toContain('<td>RO</td>')
          expect(res.text).toContain('<option value="LHDCBT003">VARY</option>')
        })
    })

    test('Redirects back to search page When invalid username', () => {
      const app = createApp('batchUser')
      migrationService.getDeliusRoles.mockResolvedValue(null)
      return request(app).get('/admin/manage-roles/BOB').expect(302).expect('Location', '/admin/manage-roles')
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).get('/admin/manage-roles/BOB').expect(403)
    })
  })

  describe('POST /admin/manage-roles/BOB/roles', () => {
    test('Adds a role and redirects to view role page', () => {
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/manage-roles/BOB/roles')
        .send({ role: responsibleOfficerRoleId })
        .expect(302)
        .expect('Location', '/admin/manage-roles/BOB')
        .expect(() => {
          expect(migrationService.addDeliusRole).toHaveBeenCalledWith('BOB', responsibleOfficerRoleId)
        })
    })

    test('Does not select a role and redirects to view role page', () => {
      const app = createApp('batchUser')
      return request(app)
        .post('/admin/manage-roles/BOB/roles')
        .send({})
        .expect(302)
        .expect('Location', '/admin/manage-roles/BOB')
        .expect(() => {
          expect(migrationService.addDeliusRole).not.toHaveBeenCalled()
        })
    })

    test('should throw if submitted by non-authorised user', () => {
      const app = createApp('roUser')
      return request(app).post('/admin/manage-roles/BOB/roles').expect(403)
    })
  })
})
