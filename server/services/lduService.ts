import * as R from 'ramda'
import logger from '../../log'
import { DeliusClient } from '../data/deliusClient'
import { ActiveLduClient } from '../data/activeLduClient'

export default class LduService {
  constructor(
    private readonly deliusClient: DeliusClient,
    private readonly activeLduClient: ActiveLduClient
  ) {}

  async getAllProbationAreas() {
    const probationAreas = await this.deliusClient.getAllProbationAreas()
    probationAreas.sort((a, b) => a.description.localeCompare(b.description, 'en', { ignorePunctuation: true }))
    return probationAreas
  }

  async getProbationArea(probationAreaCode: string) {
    const activeLdus = await this.activeLduClient.allActiveLdusInArea(probationAreaCode)
    const activeLdusCodes = activeLdus.map((ldu) => ldu.code)

    const { description, localAdminUnits: ldus } = await this.deliusClient.getProbationArea(probationAreaCode)

    const allLdus = ldus.map((ldu) => ({
      code: ldu.code,
      description: ldu.description,
      active: activeLdusCodes.includes(ldu.code)
    }))

    const uniqueLdus = [...Object.entries(R.groupBy(R.prop('code'), allLdus) as Record<string, typeof allLdus>)]
      .sort(([lduCode1], [lduCode2]) => lduCode1.localeCompare(lduCode2))
      .map(([, ldu]) => ldu.sort((ldu1, ldu2) => ldu1.description.localeCompare(ldu2.description))[0])

    return {
      code: probationAreaCode,
      description,
      ldus: uniqueLdus
    }
  }

  async updateActiveLdus(probationAreaCode: string, activeLdus: string[]): Promise<void> {
    await this.activeLduClient.updateActiveLdu(probationAreaCode, activeLdus)
    logger.info('active_local_delivery_units table updated with user selected LDUs')
  }
}
