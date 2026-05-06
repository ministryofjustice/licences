import type { ConvertedLicenseBatch } from '../@types/hdcApiImport'

export class HdcClient {
  constructor(readonly restClient) {}

  getBespokeConditions(licenceIds: number[]): Promise<ConvertedLicenseBatch> {
    return this.restClient.postResource(`/licences/conditions/batch`, { licenceIds })
  }

  async migrateToCvl(licenceId: number) : Promise<void> {
      return this.restClient.postResource(`/licences/migrate/active/${licenceId}/to-cvl`, {})
  }

  async migrateBatchToCvl() : Promise<void>  {
      return this.restClient.postResource(`/licences/migrate/active/batch/to-cvl`, {})
  }
}
