import type { RequestHandler } from 'express'
import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'

export default function addUserDataToTelemetry(): RequestHandler {
  return (req, res, next) => {
    const { user } = res.locals

    if (user) {
      telemetry.setSpanAttributes({
        ...(user.username && { username: user.username }),
        ...(user.activeCaseLoadId && { activeCaseLoadId: user.activeCaseLoadId }),
      })
    }

    return next()
  }
}
