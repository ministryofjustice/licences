import type { ConvertedLicenseBatch } from '../@types/hdcApiImport'

export class HdcClient {
  constructor(readonly restClient) {}

  getBespokeConditions(ids: number[]): Promise<ConvertedLicenseBatch> {
    return this.restClient.postResource(`/licences/conditions/batch`, { ids })
  }
}
