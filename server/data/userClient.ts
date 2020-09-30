import * as db from './dataAccess/db'

export interface RoUser {
  nomisId: string
  deliusId: string
  deliusUsername?: string
  first?: string
  last?: string
  organisation?: string
  jobRole?: string
  email?: string
  orgEmail?: string
  telephone?: string
  onboarded: boolean
  staffIdentifier: number
}

export const userClient = {
  async getRoUsers(page?): Promise<Array<RoUser>> {
    const query = page
      ? {
          text: 'select * from v_staff_ids order by nomis_id asc limit $1 offset $2',
          values: [page.limit, page.offset],
        }
      : {
          text: 'select * from v_staff_ids order by nomis_id asc',
        }

    const { rows } = await db.query(query)

    return rows.map(convertPropertyNames)
  },

  async getCasesRequiringRo(): Promise<Array<number>> {
    const query = {
      text: `select booking_id from licences where stage in ('ELIGIBILITY', 'PROCESSING_RO')`,
    }

    const { rows } = await db.query(query)

    if (rows) {
      return rows.map((r) => r.booking_id)
    }

    return []
  },

  async getRoUser(nomisId): Promise<RoUser | null> {
    const query = {
      text: 'select * from v_staff_ids where upper(nomis_id) = upper($1)',
      values: [nomisId],
    }

    const { rows } = await db.query(query)

    if (rows && rows[0]) {
      return convertPropertyNames(rows[0])
    }

    return null
  },

  async getRoUserByStaffIdentifier(staffIdentifier: number): Promise<RoUser | null> {
    const query = {
      text: 'select * from v_staff_ids where staff_identifier = $1',
      values: [staffIdentifier],
    }

    const { rows } = await db.query(query)

    if (rows && rows[0]) {
      return convertPropertyNames(rows[0])
    }

    return null
  },

  async getRoUserByDeliusUsername(username): Promise<RoUser | null> {
    const query = {
      text: 'select * from v_staff_ids where upper(delius_username) = upper($1)',
      values: [username],
    }

    const { rows } = await db.query(query)

    if (rows[0]) {
      return convertPropertyNames(rows[0])
    }

    return null
  },

  async updateRoUser(originalNomisId: string, staffIdentifier: number) {
    const query = {
      text: `update v_staff_ids
                    set staff_identifier = $2
                    where nomis_id = $1`,
      values: [originalNomisId, staffIdentifier],
    }

    return db.query(query)
  },

  async deleteRoUser(nomisId) {
    const query = {
      text: 'update v_staff_ids set deleted = true where nomis_id = $1',
      values: [nomisId],
    }

    return db.query(query)
  },

  async findRoUsers(searchTerm): Promise<Array<RoUser>> {
    const query = {
      text: `select * from v_staff_ids
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

    if (rows) {
      return rows.map(convertPropertyNames)
    }

    return []
  },
}

function convertPropertyNames(user): RoUser | null {
  return user
    ? {
        nomisId: user.nomis_id,
        deliusId: user.staff_id,
        deliusUsername: user.delius_username,
        first: user.first_name,
        last: user.last_name,
        organisation: user.organisation,
        jobRole: user.job_role,
        email: user.email,
        orgEmail: user.org_email,
        telephone: user.telephone,
        onboarded: user.auth_onboarded,
        staffIdentifier: user.staff_identifier,
      }
    : null
}
