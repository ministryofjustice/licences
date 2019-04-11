const moment = require('moment')
const db = require('./dataAccess/db')

module.exports = {
  async getDeliusUserName(nomisUserName) {
    const query = {
      text: 'select staff_id from staff_ids where nomis_id = $1',
      values: [nomisUserName],
    }

    const { rows } = await db.query(query)

    if (rows[0]) {
      return rows[0].staff_id
    }

    return undefined
  },

  async getRoUsers() {
    const query = {
      text: 'select * from staff_ids order by nomis_id asc',
    }

    const { rows } = await db.query(query)

    return rows.map(convertPropertyNames)
  },

  async getIncompleteRoUsers() {
    const query = {
      text: `select
               timestamp as sent_timestamp,
               details -> 'bookingId' as booking_id,
               details -> 'submissionTarget' -> 'com' -> 'deliusId' as sent_staffcode,
               details -> 'submissionTarget' -> 'com' -> 'name' as sent_name,
               (s.staff_id is not null) as mapped,
               s.auth_onboarded,
               s.first_name, s.last_name, s.nomis_id
             from (
                    select *,
                           row_number() over (
                             partition by (a.details -> 'submissionTarget' -> 'com' -> 'deliusId')
                             order by a.timestamp ASC
                             ) as rownbr
                    from audit a
                           left join staff_ids s
                                     on s.staff_id = (a.details-> 'submissionTarget' -> 'com' ->> 'deliusId')
                    where a.action = 'SEND'
                      and a.details @> '{ "transitionType": "caToRo" }'
                  ) s
             where rownbr = 1`,
    }

    const { rows } = await db.query(query)

    if (rows) {
      return rows.map(convertIncompleteUserPropertyNames)
    }

    return []
  },

  async getRoUser(nomisId) {
    const query = {
      text: 'select * from staff_ids where nomis_id = $1',
      values: [nomisId],
    }

    const { rows } = await db.query(query)

    return convertPropertyNames(rows[0])
  },

  async getRoUserByDeliusId(deliusId) {
    const query = {
      text: 'select * from staff_ids where staff_id = $1',
      values: [deliusId],
    }

    const { rows } = await db.query(query)

    return convertPropertyNames(rows[0])
  },

  async updateRoUser(
    originalNomisId,
    nomisId,
    deliusId,
    first,
    last,
    organisation,
    jobRole,
    email,
    orgEmail,
    telephone,
    onboarded
  ) {
    const query = {
      text: `update staff_ids 
                    set nomis_id = $2, staff_id = $3, first_name = $4, last_name = $5, 
                    organisation = $6, job_role = $7, email = $8, org_email = $9, telephone = $10, auth_onboarded = $11
                    where nomis_id = $1`,
      values: [
        originalNomisId,
        nomisId,
        deliusId,
        first,
        last,
        organisation,
        jobRole,
        email,
        orgEmail,
        telephone,
        onboarded,
      ],
    }

    return db.query(query)
  },

  async deleteRoUser(nomisId) {
    const query = {
      text: 'delete from staff_ids where nomis_id = $1',
      values: [nomisId],
    }

    return db.query(query)
  },

  async addRoUser(nomisId, deliusId, first, last, organisation, jobRole, email, orgEmail, telephone, onboarded) {
    const query = {
      text: `insert into staff_ids
                (nomis_id, staff_id, first_name, last_name, organisation, job_role, email, org_email, telephone, auth_onboarded)
                values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      values: [nomisId, deliusId, first, last, organisation, jobRole, email, orgEmail, telephone, onboarded],
    }

    return db.query(query)
  },

  async findRoUsers(searchTerm) {
    const query = {
      text: `select * from staff_ids 
                where 
                    upper(nomis_id) like upper($1) or 
                    upper(staff_id) like upper($1) or
                    upper(first_name) like upper($1) or
                    upper(last_name) like upper($1) or
                    upper(organisation) like upper($1) or
                    upper(job_role) like upper($1) or
                    upper(email) like upper($1) or
                    upper(org_email) like upper($1) or
                    upper(telephone) like upper($1)
                order by nomis_id asc`,
      values: [`%${searchTerm}%`],
    }

    const { rows } = await db.query(query)

    return rows.map(convertPropertyNames)
  },
}

function convertPropertyNames(user) {
  return user
    ? {
        nomisId: user.nomis_id,
        deliusId: user.staff_id,
        first: user.first_name,
        last: user.last_name,
        organisation: user.organisation,
        jobRole: user.job_role,
        email: user.email,
        orgEmail: user.org_email,
        telephone: user.telephone,
        onboarded: user.auth_onboarded,
      }
    : null
}

function convertIncompleteUserPropertyNames(user) {
  return user
    ? {
        first: user.first_name,
        last: user.last_name,
        mapped: user.mapped,
        onboarded: user.auth_onboarded,
        nomisId: user.nomis_id,
        sent: moment(user.sent_timestamp).format('DD/MM/YYYY'),
        bookingId: user.booking_id,
        sentStaffCode: user.sent_staffcode,
        sentName: user.sent_name,
      }
    : null
}
