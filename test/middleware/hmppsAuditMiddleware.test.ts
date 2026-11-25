import { Request, Response } from 'express'
import AuditService from '../../server/services/audit/auditService'
import config from '../../server/config'
import { hmppsAuditMiddleware } from '../../server/middleware/hmppsAuditMiddleware'

jest.mock('../../server/services/audit/auditService')

const res = {
  prependOnceListener: jest.fn(),
  locals: {
    prisoner: {
      offenderNo: 'A1234BC',
    }
  }
} as unknown as Response

const req = {
  id: 'request-id',
  baseUrl: '',
  method: 'GET',
  path: '/licence/create/id/1/check-your-answers',
  user: {
    username: 'XX'
  }
} as Request

const next = jest.fn()

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const middleware = hmppsAuditMiddleware(auditService)

beforeEach(() => {
  auditService.logPageViewAttempt.mockResolvedValue(undefined)
  config.sqs.audit.enabled = true
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('auditMiddleware', () => {
  it('should not call audit service is auditing is disabled', async() => {
    config.sqs.audit.enabled = false
    req.params = {}

    await middleware(req, res, next)

    expect(auditService.logPageViewAttempt).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should not call audit service if the route does not require auditing', async() => {
    const noAuditNeededReq = {
      ...req,
      path: '/',
    } as Request

    await middleware(noAuditNeededReq, res, next)

    expect(auditService.logPageViewAttempt).not.toHaveBeenCalled()
    expect(res.prependOnceListener).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should call audit service if the route requires auditing', async() => {
    const auditNeededReq = {
      ...req,
      path: `/admin/roUsers/verify/`,
    } as Request

    await middleware(auditNeededReq, res, next)

    expect(auditService.logPageViewAttempt).toHaveBeenCalledWith(
      req.id,
      res.locals.prisoner,
      {
        audit: true,
        eventType: 'VIEW_VERIFY_USER',
        customHandler: false,
      },
      req.user,
    )
    expect(next).toHaveBeenCalledTimes(1)
    expect(res.prependOnceListener).toHaveBeenCalledWith('finish', expect.any(Function))
  })

  it('should handle route not being found in policy config', async() => {
    const missingRouteReq = {
      ...req,
      path: '/this/route/does/not/exist',
    } as Request

    await middleware(missingRouteReq, res, next)

    expect(auditService.logPageViewAttempt).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })
})
