import type {ConvertedLicenseBatch, MigrateFromHdcToCvlRequest, Pageable, PageLicenceMigrationLogEntryDto} from '../@types/hdcApiImport'

export class HdcClient {
  constructor(readonly restClient) {}

  getBespokeConditions(licenceIds: number[]): Promise<ConvertedLicenseBatch> {
    return this.restClient.postResource(`/licences/conditions/batch`, { licenceIds })
  }

  async migrateBatchToCvl() : Promise<void>  {
       return this.restClient.postResource(`/licences/migrate/batch/to-cvl`, {})
  }

  async migrateSingleLicenceToCvl(bookingId: number) : Promise<void> {
      return this.restClient.postResource(`/licences/migrate/${bookingId}/to-cvl`, {})
  }

  async migrateSingleLicenceToCvlPreview(licenceId: number): Promise<MigrateFromHdcToCvlRequest> {
      return this.restClient.getResource(`/licences/migrate/${licenceId}/to-cvl/preview`)
  }

  async getMigrationLogs(licenceVersionId?: number, bookingId?: number, errorSource?: string, success?: boolean, pageable?: Pageable): Promise<PageLicenceMigrationLogEntryDto> {
    return this.restClient.getResource(`/licences/migrate/logs`, {}, { licenceVersionId, bookingId, errorSource, success, ...pageable })
  }

  async setMigrationLogRetry(logId: number, retryValue: boolean): Promise<void> {
    return this.restClient.putResource(`/licences/migrate/${logId}/retry/${retryValue}`)
  }
}
