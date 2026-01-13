import { Contracts, defaultClient, DistributedTracingModes, setup, TelemetryClient } from 'applicationinsights'
import { EnvelopeTelemetry } from 'applicationinsights/out/Declarations/Contracts'
import applicationVersion from '../applicationVersion'

export type ContextObject = {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  [name: string]: any
}

function defaultName(): string {
  const {
    packageData: { name },
  } = applicationVersion
  return name
}

function version(): string {
  const { buildNumber } = applicationVersion
  return buildNumber
}

export function initialiseAppInsights(): void {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    console.log('Enabling azure application insights')

    setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
  }
}

export function buildAppInsightsClient(name = defaultName()): TelemetryClient {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    defaultClient.context.tags['ai.cloud.role'] = name
    defaultClient.context.tags['ai.application.ver'] = version()
    defaultClient.addTelemetryProcessor(addUserDataToRequests)
    return defaultClient
  }
  return null
}

export function addUserDataToRequests(envelope: EnvelopeTelemetry, contextObjects: ContextObject) {
  const isRequest = envelope.data.baseType === Contracts.TelemetryTypeString.Request
  if (isRequest) {
    const { username, activeCaseLoadId } = contextObjects?.['http.ServerRequest']?.res?.locals?.user || {}
    const { properties } = envelope.data.baseData
    envelope.data.baseData.properties = Object.assign(properties || {}, {
      ...(username && { username }),
      ...(activeCaseLoadId && { activeCaseLoadId }),
    })
  }
  return true
}

initialiseAppInsights()
export const appInsights = buildAppInsightsClient()
