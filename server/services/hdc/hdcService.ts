import { HdcClient } from '../../data/hdcApiClient'
import { ConvertedLicenseBatch, ConvertedLicenseConditions } from '../../@types/hdcApiImport'
import { LicenceService } from '../licenceService'
import { ConditionsServiceFactory } from '../conditionsService'
import { CURRENT_CONDITION_VERSION } from '../config/conditionsConfig'
import { LicenceWithCase } from '../../data/licenceClientTypes'

const logger = require('../../../log')

export class ComparedConditions {
  constructor(
    public id: number,
    public bookingId: number,
    public version: number,
    public additionalConditions: { code: string; text: string }[]
  ) {}
}

export type ConditionDiff = {
  code: string
  uiText?: string
  apiText?: string
}

export type LicenceDiff = {
  id: number
  differences: ConditionDiff[]
  version: number
}

export class HdcService {
  constructor(
    private hdcClient: HdcClient,
    private licenceService: LicenceService,
    private conditionsServiceFactory: ConditionsServiceFactory
  ) {}

  async getBespokeConditions(licenceIds: number[]): Promise<ConvertedLicenseBatch> {
    try {
      return await this.hdcClient.getBespokeConditions(licenceIds)
    } catch (error: any) {
      logger.error(`Failed to get bespoke conditions for IDs: [${licenceIds?.join(', ') ?? 'none'}]`, {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        stack: error?.stack,
      })
      throw error
    }
  }

  async compareConditions(
    idFrom: number,
    idTo: number,
    codeFilter?: string,
    versionRequested?: number
  ): Promise<LicenceDiff[]> {
    const excludedCodes = codeFilter
      ? codeFilter
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      : []

    const licenceRange = await this.licenceService.getLicenceRange(idFrom, idTo, versionRequested)
    const comparedConditions = this.getUiAdditionalCodnditions(licenceRange)
    const idsWithAdditionalConditions = comparedConditions.map((c) => c.id)
    if (!idsWithAdditionalConditions.length) {
      logger.info(`No additional conditions found for licence range: [${idFrom}-${idTo}]`)
      return []
    }
    const apiConditionsBatch = await this.getBespokeConditions(idsWithAdditionalConditions)
    return this.compareLicenceConditions(comparedConditions, apiConditionsBatch.conditions, excludedCodes)
  }

  private getUiAdditionalCodnditions(licenceRange: Array<LicenceWithCase>) {
    return licenceRange
      .map(({ id, booking_id, licence, additional_conditions_version }) => {
        const version = additional_conditions_version || CURRENT_CONDITION_VERSION
        const uiConditions = this.conditionsServiceFactory.forVersion(version).getFullTextAdditionalConditions(licence)

        if (!uiConditions?.length) return null

        return new ComparedConditions(
          id,
          booking_id,
          version,
          uiConditions.map(({ conditionCode, conditionText }) => ({
            code: conditionCode,
            text: conditionText,
          }))
        )
      })
      .filter(Boolean)
  }

  compareLicenceConditions(
    comparedConditions: ComparedConditions[],
    convertedConditions: ConvertedLicenseConditions[],
    excludedCodes: string[]
  ): LicenceDiff[] {
    const uiMap = new Map(comparedConditions.map((c) => [c.id, c]))

    return convertedConditions
      .map((apiLicence) => {
        const ui = uiMap.get(apiLicence.id)
        if (!ui) return null

        const uiByCode = new Map(ui.additionalConditions.map((c) => [c.code, c.text]))
        const apiByCode = new Map(apiLicence.conditions.map((c) => [c.code, c.text]))

        const differences: ConditionDiff[] = []

        // API -> UI differences
        apiByCode.forEach((apiText, code) => {
          if (excludedCodes.includes(code)) return
          const uiText = uiByCode.get(code)
          if (!uiText || uiText !== apiText) differences.push({ code, uiText, apiText })
        })

        // UI -> API missing codes
        uiByCode.forEach((uiText, code) => {
          if (excludedCodes.includes(code)) return
          if (!apiByCode.has(code)) differences.push({ code, uiText })
        })

        if (differences.length) {
          return { id: apiLicence.id, differences, version: ui.version }
        }

        return null
      })
      .filter(Boolean) as LicenceDiff[]
  }
}

export function createHdcService(
  hdcClient: HdcClient,
  licenceService: LicenceService,
  conditionsServiceFactory: ConditionsServiceFactory
) {
  return new HdcService(hdcClient, licenceService, conditionsServiceFactory)
}
