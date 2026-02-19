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
    public prisonCode: string,
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
  prisonCode: string
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
    versionRequested?: number,
    cleanUi?: boolean,
    cleanApi?: boolean
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
    return this.compareLicenceConditions(
      comparedConditions,
      apiConditionsBatch.conditions,
      excludedCodes,
      cleanUi,
      cleanApi
    )
  }

  private getUiAdditionalCodnditions(licenceRange: Array<LicenceWithCase>) {
    return licenceRange
      .map(({ id, prison_number, booking_id, licence, additional_conditions_version }) => {
        const version = additional_conditions_version || CURRENT_CONDITION_VERSION
        const uiConditions = this.conditionsServiceFactory.forVersion(version).getFullTextAdditionalConditions(licence)

        if (!uiConditions?.length) return null

        return new ComparedConditions(
          id,
          prison_number,
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

  private removeDiscrepanciesUi(code: string, text: string, version: number): string {
    let out = text

    // Normalize
    out = out.normalize('NFKC')

    // Remove commas like ", ,"
    out = out.replace(/\s*,\s*,\s*/g, ', ')
    //  " , , "
    out = out.replace(/\s+,/g, ', ')
    //  " , ,"
    out = out.replace(/,\s+,/g, ', ')
    //  ", ," cleanup
    out = out.replace(/,\s*,/g, ',')

    // Fix "on // at ," to "on //"
    out = out.replace(/on\s*\/\/\s*at\s*,?/gi, 'on //')

    if (code === 'REPORTTO') {
      const trailingMatch = text.match(/(Monthly|Weekly|Daily|Yearly)\s*$/i)

      if (trailingMatch) {
        const frequency = trailingMatch[1]

        // Remove the trailing frequency word and any trailing dots/spaces
        out = out.replace(new RegExp(`\\.*${frequency}\\s*$`, 'i'), '')

        // Replace "on a basis" with "on a <frequency> basis" (case-insensitive, multiple spaces)
        out = out.replace(/on a\s+basis/i, `on a ${frequency} basis`)
        out = out.replace('on a yes basis', `on a ${frequency} basis`)

        // Cleanup double spaces
        out = out.replace(/\s{2,}/g, ' ').trim()

        // Ensure a single period at the end
        if (!out.endsWith('.')) out += '.'
      }
    }

    if (code === 'DRUG_TESTING' || code == 'ATTEND_SAMPLE') {
      out = out.replace(/^Attend,/, 'Attend')
    }

    // Collapse extra spaces
    out = out.replace(/\s{2,}/g, ' ')

    out = out.replace(' of ending on,', ' of,')
    out = out.replace(' on at ', ' at ')

    if (code === 'ATTEND_DEPENDENCY_IN_DRUGS_SECTION') {
      out = out.replace(' on at,', ',')
    }

    return this.ensureFullStop(out.trim())
  }

  private removeDiscrepanciesApi(code: string, text: string, version: number): string {
    let out = text

    // Normalize
    out = out.normalize('NFKC')

    if (code === 'DRUG_TESTING' || code == 'ATTEND_SAMPLE') {
      out = out.replace(/^Attend,/, 'Attend')
    }

    // Collapse extra spaces
    out = out.replace(/\s{2,}/g, ' ')
    return this.ensureFullStop(out.trim())
  }

  private ensureFullStop(out: string) {
    if (out && !out.endsWith('.')) {
      out += '.'
    }
    return out
  }

  compareLicenceConditions(
    comparedConditions: ComparedConditions[],
    convertedConditions: ConvertedLicenseConditions[],
    excludedCodes: string[],
    cleanUi: boolean,
    cleanApi: boolean
  ): LicenceDiff[] {
    const uiMap = new Map(comparedConditions.map((c) => [c.id, c]))

    return convertedConditions
      .map((apiLicence) => {
        const ui = uiMap.get(apiLicence.id)
        if (!ui) return null

        const uiByCode = new Map(
          ui.additionalConditions.map((c) => [
            c.code,
            cleanUi ? this.removeDiscrepanciesUi(c.code, c.text, ui.version) : c.text,
          ])
        )
        const apiByCode = new Map(
          apiLicence.conditions.map((c) => [
            c.code,
            cleanApi ? this.removeDiscrepanciesApi(c.code, c.text, ui.version) : c.text,
          ])
        )

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
          return { id: apiLicence.id, prisonCode: ui.prisonCode, differences, version: ui.version }
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
