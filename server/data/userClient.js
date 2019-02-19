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
    telephone
  ) {
    const query = {
      text: `update staff_ids 
                    set nomis_id = $2, staff_id = $3, first_name = $4, last_name = $5, 
                    organisation = $6, job_role = $7, email = $8, org_email = $9, telephone = $10 
                    where nomis_id = $1`,
      values: [originalNomisId, nomisId, deliusId, first, last, organisation, jobRole, email, orgEmail, telephone],
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

  async addRoUser(nomisId, deliusId, first, last, organisation, jobRole, email, orgEmail, telephone) {
    const query = {
      text: `insert into staff_ids
                (nomis_id, staff_id, first_name, last_name, organisation, job_role, email, org_email, telephone)
                values($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      values: [nomisId, deliusId, first, last, organisation, jobRole, email, orgEmail, telephone],
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
      }
    : null
}
