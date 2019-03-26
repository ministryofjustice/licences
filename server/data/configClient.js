const db = require('./dataAccess/db')

module.exports = {
  async getAllMailboxes() {
    const query = {
      text: 'select * from notifications_config order by establishment ASC',
    }

    const { rows } = await db.query(query)

    return rows
  },

  async getMailboxes(establishment, role) {
    const query = {
      text: 'select * from notifications_config where establishment = $1 and role = $2  order by establishment ASC',
      values: [establishment, role],
    }

    const { rows } = await db.query(query)

    return rows
  },

  async getMailbox(id) {
    const query = {
      text: 'select * from notifications_config where id = $1',
      values: [id],
    }

    const { rows } = await db.query(query)

    return rows[0]
  },

  async updateMailbox(id, { email, establishment, role, name }) {
    const query = {
      text: `update notifications_config 
                    set email = $2, establishment = $3, role = $4, name = $5
                    where id = $1`,
      values: [id, email, establishment, role, name],
    }

    return db.query(query)
  },

  async deleteMailbox(id) {
    const query = {
      text: 'delete from notifications_config where id = $1',
      values: [id],
    }

    return db.query(query)
  },

  async addMailbox({ email, establishment, role, name }) {
    const query = {
      text: `insert into notifications_config
                (email, establishment, role, name)
                values($1, $2, $3, $4)`,
      values: [email, establishment, role, name],
    }

    return db.query(query)
  },
}
