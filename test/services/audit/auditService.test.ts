import { AuditService as HmppsAuditService } from '@ministryofjustice/hmpps-audit-client'
import { Request } from 'express'
import AuditService from '../../../server/services/audit/auditService'
import config from '../../../server/config'
import { RoUser } from '../../../server/data/userClient'

jest.mock('../../../server/data/licenceClient')
jest.mock('@ministryofjustice/hmpps-audit-client')

describe('AuditService', () => {
  const hmppsAuditService = new HmppsAuditService(null) as jest.Mocked<HmppsAuditService>
  const auditService = new AuditService(hmppsAuditService) as jest.Mocked<AuditService>

  const user = {
    username: 'a user',
    roles: ['CA'],
  }

  const requestId = 'request-id'
  const prisoner = {
    offenderNo: 'A1234BC',
  }

  beforeEach(() => {
    config.sqs.audit.enabled = true
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should not send an event if audit is disabled', async() => {
    config.sqs.audit.enabled = false
    const eventType = 'VIEWED_SOMETHING'

    await auditService.logPageViewAttempt(requestId, prisoner, {eventType, audit: true}, user)

    expect(hmppsAuditService.logAuditEvent).not.toHaveBeenCalled()
  })

  it('should log an event for a page view attempt', async() => {
    const eventType = 'VIEWED_SOMETHING'
    hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

    await auditService.logPageViewAttempt(requestId, prisoner, {eventType, audit: true}, user)

    expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
      what: `${eventType}_ATTEMPT`,
      subjectType: 'PRISONER_ID',
      subjectId: prisoner.offenderNo,
      correlationId: requestId,
      who: user.username,
      details: {
        build: config.gitRef,
        userRoles: user.roles,
      },
    })
  })

  it('should log an event for a successful page view', async() => {
    const eventType = 'VIEWED_SOMETHING'
    hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

    await auditService.logPageViewSuccess(requestId, prisoner, {eventType, audit: true}, user)

    expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
      what: `${eventType}_SUCCESS`,
      subjectType: 'PRISONER_ID',
      subjectId: prisoner.offenderNo,
      correlationId: requestId,
      who: user.username,
      details: {
        build: config.gitRef,
        userRoles: user.roles,
      },
    })
  })

  it('should log an event for failure to access something', async() => {
    const request = {
      id: 'request-id',
      baseUrl: '',
      method: 'GET',
      path: '/hdc/people-ready-for-probation-checks',
    } as Request
    const failureReason = 'Access denied'

    hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

    await auditService.logPageAccessFailure(request, prisoner, failureReason, user)

    expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
      what: `VIEW_PEOPLE_READY_FOR_PROBATION_CHECKS_FAILURE`,
      subjectType: 'PRISONER_ID',
      subjectId: prisoner.offenderNo,
      correlationId: requestId,
      who: user.username,
      details: {
        build: config.gitRef,
        userRoles: user.roles,
        failureReason,
      },
    })
  })

  it('should log an event for viewing the case list', async() => {
    const request = {
      id: 'request-id',
      baseUrl: '',
      method: 'GET',
      path: '/hdc/tasklist',
    } as Request
    const cases = [
      {offenderNo: 'A1234BC'},
      {offenderNo: 'B2345CD'},
    ]
    hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

    await auditService.logCaseListView(request.id, cases, user)

    expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
      what: `VIEW_CASE_LIST_SUCCESS`,
      subjectType: 'NOT_APPLICABLE',
      subjectId: '',
      correlationId: requestId,
      who: user.username,
      details: {
        build: config.gitRef,
        userRoles: user.roles,
        results: {
          resultCount: cases.length,
          returnedSubjectIds: cases.map((c: any) => c.offenderNo),
        },
      },
    })
  })

  it('should log an event for searching COM users', async() => {
      const request = {
        id: 'request-id',
        baseUrl: '',
        method: 'GET',
        path: '/admin/roUsers',
      } as Request
      const cases = [
        {deliusId: 'deliusId1'},
        {deliusId: 'deliusId2'},
      ] as Array<RoUser>
      const searchTerm = 'search term'

      hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

      await auditService.logComUsersSearchEvent(request.id, searchTerm, cases, user)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: `SEARCH_COM_USERS_SUCCESS`,
        subjectType: 'SEARCH_TERM',
        subjectId: searchTerm,
        correlationId: requestId,
        who: user.username,
        details: {
          build: config.gitRef,
          userRoles: user.roles,
          results: {
            resultCount: cases.length,
            returnedSubjectIds: cases.map((c: any) => c.deliusId),
          },
        },
      })
    }
  )
})
