import * as db from './dataAccess/db'
import {
  ApprovedLicenceVersion,
  CaseWithApprovedVersion,
  CaseWithVaryVersion,
  ConditionVersion,
  DeliusIds,
} from './licenceClientTypes'
import { Licence, LicenceStage } from './licenceTypes'

async function updateVersion(bookingId, postRelease = false): Promise<void> {
  const version = postRelease ? 'vary_version' : 'version'
  const query = {
    text: `UPDATE licences SET ${version} = ${version} + 1
               WHERE booking_id = $1 and ${version} in (
                SELECT max(${version})
                FROM licence_versions
                WHERE booking_id = $1);`,
    values: [bookingId],
  }
  return db.query(query)
}

export class LicenceClient {
  // eslint-disable-next-line class-methods-use-this
  deleteAll() {
    return db.query(`delete from licences where booking_id != 1200635;
        delete from licence_versions where booking_id != 1200635`)
  }

  // eslint-disable-next-line class-methods-use-this
  deleteAllTest() {
    return db.query(`delete from licences where booking_id < 23 or booking_id = '1200635';
          delete from licence_versions where booking_id < 23 or booking_id = '1200635'`)
  }

  // eslint-disable-next-line class-methods-use-this
  async getLicences(bookingIds): Promise<Array<CaseWithApprovedVersion>> {
    const query = {
      text: `select l.licence, l.booking_id, l.stage, l.version, l.transition_date,
                   v.version as approved_version
                   from licences l
                   left outer join licence_versions v on v.id = (
                   select id from licence_versions
                   where booking_id = l.booking_id
                   order by version desc limit 1
                   )
                   where l.booking_id in (${bookingIds.map((id) => `'${id}'`).join(',')})`,
    }

    const { rows } = await db.query(query)
    return rows
  }

  // eslint-disable-next-line class-methods-use-this
  async getLicence(bookingId: number): Promise<CaseWithVaryVersion> {
    const query = {
      text: `select licence, booking_id, stage, version, vary_version, additional_conditions_version from licences where booking_id = $1`,
      values: [bookingId],
    }

    const { rows } = await db.query(query)

    if (rows) {
      return rows[0]
    }

    return undefined
  }

  // eslint-disable-next-line class-methods-use-this
  async getApprovedLicenceVersion(bookingId): Promise<ApprovedLicenceVersion> {
    const query = {
      text: `select version, vary_version, template, timestamp from licence_versions
                    where booking_id = $1 order by version desc, vary_version desc limit 1`,
      values: [bookingId],
    }

    const { rows } = await db.query(query)

    if (rows && rows[0]) {
      return rows[0]
    }

    return null
  }

  // eslint-disable-next-line class-methods-use-this
  createLicence(
    bookingId: number,
    licence: Licence = {},
    stage: string = LicenceStage.DEFAULT,
    version: number = 1,
    varyVersion: number = 0
  ): Promise<number> {
    const query = {
      text: 'insert into licences (booking_id, licence, stage, version, vary_version) values ($1, $2, $3, $4, $5)',
      values: [bookingId, licence, stage, version, varyVersion],
    }

    return db.query(query)
  }

  // eslint-disable-next-line class-methods-use-this
  async updateLicence(bookingId: number, licence: Licence = {}, postRelease: boolean = false): Promise<void> {
    const query = {
      text: 'UPDATE licences SET licence = $1 where booking_id=$2;',
      values: [licence, bookingId],
    }

    await db.query(query)
    return updateVersion(bookingId, postRelease)
  }

  // eslint-disable-next-line class-methods-use-this
  async updateSection(section, bookingId: number, object, postRelease: boolean = false) {
    const path = `{${section}}`

    const query = {
      text: 'update licences set licence = jsonb_set(licence, $1, $2) where booking_id=$3',
      values: [path, object, bookingId],
    }

    await db.query(query)
    return updateVersion(bookingId, postRelease)
  }

  // eslint-disable-next-line class-methods-use-this
  updateStage(bookingId: number, stage): Promise<void> {
    const query = {
      text: 'update licences set (stage, transition_date) = ($1, current_timestamp) where booking_id = $2',
      values: [stage, bookingId],
    }

    return db.query(query)
  }

  // eslint-disable-next-line class-methods-use-this
  async getDeliusIds(nomisUserName): Promise<DeliusIds[]> {
    const query = {
      text: 'select staff_identifier "staffIdentifier", delius_username "deliusUsername" from v_staff_ids where upper(nomis_id) = upper($1)',
      values: [nomisUserName],
    }

    const { rows } = await db.query(query)
    return rows
  }

  // eslint-disable-next-line class-methods-use-this
  saveApprovedLicenceVersion(bookingId, template) {
    const query = {
      text: `insert into licence_versions (booking_id, licence, version, vary_version, template)
                    select booking_id, licence, version, vary_version, $1
                    from licences where booking_id = $2`,
      values: [template, bookingId],
    }

    return db.query(query)
  }

  // eslint-disable-next-line class-methods-use-this
  async getLicencesInStageBetweenDates(stage, from, upto) {
    const query = {
      text: `select l.booking_id, l.transition_date
                   from licences l where stage = $1 and transition_date >= $2 and transition_date < $3`,
      values: [stage, from, upto],
    }

    const { rows } = await db.query(query)
    return rows
  }

  // eslint-disable-next-line class-methods-use-this
  async getLicencesInStageBeforeDate(stage, upto) {
    const query = {
      text: `select l.booking_id, l.transition_date
                   from licences l where stage = $1 and transition_date < $2`,
      values: [stage, upto],
    }

    const { rows } = await db.query(query)
    return rows
  }

  async setConditionsVersion(bookingId: number, conditionVersion: ConditionVersion): Promise<void> {
    const query = {
      text: `update licences l set additional_conditions_version = $1 where booking_id = $2`,
      values: [conditionVersion, bookingId],
    }

    await db.query(query)
  }
}

export const licenceClient = new LicenceClient()
