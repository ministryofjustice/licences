import type { Request, Response } from 'express'
import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import addUserDataToTelemetry from '../../server/utils/addUserDataToTelemetry'

jest.mock('@ministryofjustice/hmpps-azure-telemetry', () => ({
  telemetry: {
    setSpanAttributes: jest.fn(),
  },
}))

const req = {} as Request
let res = {} as Response
const next = jest.fn()

describe('addUserDataToTelemetry', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    res = {
      locals: {},
    } as unknown as Response
  })

  it('adds CVL user data to telemetry when a user is present', () => {
    res.locals.user = {
      username: 'joebloggs',
      activeCaseLoadId: 'MDI',
    }

    addUserDataToTelemetry()(req, res, next)

    expect(telemetry.setSpanAttributes).toHaveBeenCalledWith({
      username: 'joebloggs',
      activeCaseLoadId: 'MDI',
    })
    expect(next).toHaveBeenCalledTimes(1)
  })
})
