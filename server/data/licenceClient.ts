import * as db from './dataAccess/db'
import {
  ApprovedLicenceVersion,
  CaseWithApprovedVersion,
  CaseWithVaryVersion,
  AdditionalConditionsVersion,
  DeliusIds,
  StandardConditionsVersion,
} from './licenceClientTypes'
import { Licence, LicenceStage } from './licenceTypes'

async function updateVersion(bookingId, postRelease = false): Promise<void> {
  const version = postRelease ? 'vary_version' : 'version'
  const query = {
    text: `UPDATE v_licences_excluding_deleted SET ${version} = ${version} + 1
               WHERE booking_id = $1 and ${version} in (
                SELECT max(${version})
                FROM v_licence_versions_excluding_deleted
                WHERE booking_id = $1);`,
    values: [bookingId],
  }
  return db.query(query)
}

async function softDeleteVersions(bookingId): Promise<void> {
  const query = {
    text: 'UPDATE v_licence_versions_excluding_deleted SET deleted_at = current_timestamp where booking_id = $1 and deleted_at is null;',
    values: [bookingId],
  }
  return db.query(query)
}

export class LicenceClient {
  deleteAll() {
    return db.query(`delete from licences where booking_id != 1200635;
        delete from licence_versions where booking_id != 1200635`)
  }

  deleteAllTest() {
    return db.query(`delete from licences where booking_id < 23 or booking_id = '1200635';
          delete from licence_versions where booking_id < 23 or booking_id = '1200635'`)
  }

  async getLicences(bookingIds): Promise<Array<CaseWithApprovedVersion>> {
    const query = {
      text: `select l.licence, l.booking_id, l.stage, l.version, l.transition_date,
                   v.version as approved_version
                   from v_licences_excluding_deleted l
                   left outer join v_licence_versions_excluding_deleted v on v.id = (
                   select id from v_licence_versions_excluding_deleted
                   where booking_id = l.booking_id
                   order by version desc limit 1
                   )
                   where l.booking_id in (${bookingIds.map((id) => `'${id}'`).join(',')})`,
    }

    const { rows } = await db.query(query)
    return rows
  }

  async getLicence(bookingId: number): Promise<CaseWithVaryVersion> {
    const query = {
      text: `select licence, booking_id, stage, version, vary_version, additional_conditions_version, standard_conditions_version from v_licences_excluding_deleted where booking_id = $1`,
      values: [bookingId],
    }

    const { rows } = await db.query(query)

    if (rows) {
      return rows[0]
    }

    return undefined
  }

  async getApprovedLicenceVersion(bookingId): Promise<ApprovedLicenceVersion> {
    const query = {
      text: `select version, vary_version, template, timestamp from v_licence_versions_excluding_deleted
                    where booking_id = $1 order by version desc, vary_version desc limit 1`,
      values: [bookingId],
    }

    const { rows } = await db.query(query)

    if (rows && rows[0]) {
      return rows[0]
    }

    return null
  }

  createLicence(
    bookingId: number,
    prisonNumber,
    licence: Licence = {},
    stage: string = LicenceStage.DEFAULT,
    version: number = 1,
    varyVersion: number = 0
  ): Promise<number> {
    const query = {
      text: 'insert into licences (booking_id, prison_number, licence, stage, version, vary_version) values ($1, $2, $3, $4, $5, $6)',
      values: [bookingId, prisonNumber, licence, stage, version, varyVersion],
    }

    return db.query(query)
  }

  async updateLicence(bookingId: number, licence: Licence = {}, postRelease: boolean = false): Promise<void> {
    const query = {
      text: 'UPDATE v_licences_excluding_deleted SET licence = $1 where booking_id=$2;',
      values: [licence, bookingId],
    }

    await db.query(query)
    return updateVersion(bookingId, postRelease)
  }

  async updateSection(section, bookingId: number, object, postRelease: boolean = false) {
    const path = `{${section}}`

    const query = {
      text: 'update v_licences_excluding_deleted set licence = jsonb_set(licence, $1, $2) where booking_id=$3',
      values: [path, object, bookingId],
    }

    await db.query(query)
    return updateVersion(bookingId, postRelease)
  }

  updateStage(bookingId: number, stage): Promise<void> {
    const query = {
      text: 'update v_licences_excluding_deleted set (stage, transition_date) = ($1, current_timestamp) where booking_id = $2',
      values: [stage, bookingId],
    }

    return db.query(query)
  }

  async getDeliusIds(nomisUserName): Promise<DeliusIds[]> {
    const query = {
      text: 'select staff_identifier "staffIdentifier", delius_username "deliusUsername" from v_staff_ids where upper(nomis_id) = upper($1)',
      values: [nomisUserName],
    }

    const { rows } = await db.query(query)
    return rows
  }

  saveApprovedLicenceVersion(bookingId, template) {
    const query = {
      text: `insert into licence_versions (prison_number, booking_id, licence, version, vary_version, template)
                    select prison_number, booking_id, licence, version, vary_version, $1
                    from licences where booking_id = $2`,
      values: [template, bookingId],
    }

    return db.query(query)
  }

  async getLicencesInStageBetweenDates(stage, from, upto) {
    const query = {
      text: `select l.booking_id, l.transition_date
                   from v_licences_excluding_deleted l where stage = $1 and transition_date >= $2 and transition_date < $3`,
      values: [stage, from, upto],
    }

    const { rows } = await db.query(query)
    return rows
  }

  async getLicencesInStageBeforeDate(stage, upto) {
    const query = {
      text: `select l.booking_id, l.transition_date
                   from v_licences_excluding_deleted l where stage = $1 and transition_date < $2`,
      values: [stage, upto],
    }

    const { rows } = await db.query(query)
    return rows
  }

  async getLicencesInStage(stage) {
    const query = {
      text: `select l.booking_id , l.transition_date from v_licences_excluding_deleted l where stage = $1`,
      values: [stage],
    }

    const { rows } = await db.query(query)
    return rows
  }

  async setAdditionalConditionsVersion(
    bookingId: number,
    additionalConditionsVersion: AdditionalConditionsVersion
  ): Promise<void> {
    const query = {
      text: `update v_licences_excluding_deleted l set additional_conditions_version = $1 where booking_id = $2`,
      values: [additionalConditionsVersion, bookingId],
    }

    await db.query(query)
  }

  async setStandardConditionsVersion(
    bookingId: number,
    standardConditionsVersion: StandardConditionsVersion
  ): Promise<void> {
    const query = {
      text: `update v_licences_excluding_deleted l
             set standard_conditions_version = $1
             where booking_id = $2`,
      values: [standardConditionsVersion, bookingId],
    }

    await db.query(query)
  }

  async softDeleteLicence(bookingId: number): Promise<void> {
    const query = {
      text: 'UPDATE v_licences_excluding_deleted SET deleted_at = current_timestamp where booking_id = $1 and deleted_at is null;',
      values: [bookingId],
    }

    await db.query(query)
    return softDeleteVersions(bookingId)
  }
}

export const licenceClient = new LicenceClient()
