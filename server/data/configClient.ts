import * as db from './dataAccess/db'

export interface Mailbox {
  id: number
  email: string
  establishment: string
  role: string
  name: string
}

export type MailboxInput = Omit<Mailbox, 'id'>

const configClient = {
  async getAllMailboxes(): Promise<Mailbox[]> {
    const query = {
      text: 'select * from notifications_config order by establishment ASC',
    }

    const { rows } = await db.query(query)

    return rows
  },

  async getMailboxes(establishment: string, role: string): Promise<Mailbox[]> {
    const query = {
      text: 'select id, email, establishment, role, name from notifications_config where establishment = $1 and role = $2  order by establishment ASC',
      values: [establishment, role],
    }

    const { rows } = await db.query(query)

    return rows
  },

  async getMailbox(id: number | string): Promise<Mailbox | Record<string, never>> {
    const query = {
      text: 'select id, email, establishment, role, name from notifications_config where id = $1',
      values: [id],
    }

    const { rows } = await db.query(query)

    return rows ? rows[0] : {}
  },

  async updateMailbox(id: number | string, { email, establishment, role, name }: MailboxInput) {
    const query = {
      text: `update notifications_config
                    set email = $2, establishment = $3, role = $4, name = $5
                    where id = $1`,
      values: [id, email, establishment, role, name],
    }

    return db.query(query)
  },

  async deleteMailbox(id: number | string) {
    const query = {
      text: 'delete from notifications_config where id = $1',
      values: [id],
    }

    return db.query(query)
  },

  async addMailbox({ email, establishment, role, name }: MailboxInput) {
    const query = {
      text: `insert into notifications_config
                (email, establishment, role, name)
                values($1, $2, $3, $4)`,
      values: [email, establishment, role, name],
    }

    return db.query(query)
  },

  async getJobSpec(name: string) {
    const query = {
      text: 'select spec from job_config where name = $1',
      values: [name],
    }

    const { rows } = await db.query(query)

    return rows ? rows[0].spec : {}
  },

  async setJobSpec(name: string, spec: unknown) {
    const query = {
      text: `update job_config set spec = $2 where name = $1`,
      values: [name, spec],
    }

    return db.query(query)
  },
}

export default configClient
