import hash from 'string-hash'
import * as db from './dataAccess/db'
import { getIn } from '../utils/functionalHelpers'

type LockFunction = 'pg_try_advisory_lock' | 'pg_advisory_unlock'

async function queryForLock(name: string, lockFunction: LockFunction): Promise<boolean> {
  const identifier = hash(name)
  const query = { text: `select ${lockFunction}($1)`, values: [identifier] }
  const res = await db.query(query)
  return getIn(res, ['rows', [0], lockFunction])
}

export interface DbLockingClient {
  tryLock: (name: string) => Promise<boolean>
  unlock: (name: string) => Promise<boolean>
}

const dbLockingClient: DbLockingClient = {
  async tryLock(name) {
    return queryForLock(name, 'pg_try_advisory_lock')
  },

  async unlock(name) {
    return queryForLock(name, 'pg_advisory_unlock')
  },
}

export default dbLockingClient
