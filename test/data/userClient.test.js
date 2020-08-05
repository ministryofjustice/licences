jest.mock('../../server/data/dataAccess/db')

const userClient = require('../../server/data/userClient')
/** @type {any} */
const db = require('../../server/data/dataAccess/db')

afterEach(() => {
  db.query.mockReset()
})

describe('userClient', () => {
  const user1 = {
    nomis_id: 'user1',
    staff_id: 'd1',
    first_name: 'f1',
    last_name: 'l1',
  }

  const user2 = {
    nomis_id: 'user2',
    staff_id: 'd2',
    first_name: 'f2',
    last_name: 'l2',
  }

  const standardResponse = { rows: [{ user1, user2 }] }

  beforeEach(() => {
    db.query = jest.fn().mockResolvedValue(standardResponse)
  })

  describe('getRoUsers', () => {
    test('should call query', () => {
      userClient.getRoUsers()
      expect(db.query).toHaveBeenCalledWith({
        text: 'select * from staff_ids order by nomis_id asc',
      })
    })

    test('can do paged query', () => {
      userClient.getRoUsers({ limit: 20, offset: 0 })
      expect(db.query).toHaveBeenCalledWith({
        text: 'select * from staff_ids order by nomis_id asc limit $1 offset $2',
        values: [20, 0],
      })
    })

    test('should return empty if no matches', async () => {
      db.query.mockResolvedValue({ rows: [] })
      const result = await userClient.getRoUsers()
      expect(db.query).toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })

  describe('getCasesRequiringRo', () => {
    const cases = {
      rows: [{ booking_id: 1 }, { booking_id: 3 }, { booking_id: 4 }],
    }

    beforeEach(() => {
      db.query = jest.fn().mockReturnValue(cases)
    })

    test('should call query', () => {
      userClient.getCasesRequiringRo()
      expect(db.query).toHaveBeenCalled()
    })

    test('should extract booking ids', async () => {
      const results = await userClient.getCasesRequiringRo()
      expect(db.query).toHaveBeenCalled()
      expect(results).toEqual([1, 3, 4])
    })

    test('should return empty if no results', async () => {
      db.query = jest.fn().mockReturnValue({})
      const results = await userClient.getCasesRequiringRo()
      expect(db.query).toHaveBeenCalled()
      expect(results).toEqual([])
    })
  })

  describe('getRoUser', () => {
    test('should call query', () => {
      userClient.getRoUser('id')
      expect(db.query).toHaveBeenCalled()
    })

    test('should pass in the correct params and do case-insensitive search', async () => {
      const expectedClause = 'where upper(nomis_id) = upper($1)'

      await userClient.getRoUser('id')

      const { text } = db.query.mock.calls[0][0]
      expect(text).toContain(expectedClause)
    })

    test('should return empty if no matches', async () => {
      db.query = jest.fn().mockReturnValue({})
      const result = await userClient.getRoUser('id')
      expect(db.query).toHaveBeenCalled()
      expect(result).toBe(null)
    })
  })

  describe('getRoUserByDeliusId', () => {
    test('should call query', () => {
      userClient.getRoUserByDeliusId('id')
      expect(db.query).toHaveBeenCalled()
    })

    test('should pass in the correct params and do case-insensitive search', async () => {
      const expectedClause = 'where upper(staff_id) = upper($1)'

      await userClient.getRoUserByDeliusId('id')

      const { text, values } = db.query.mock.calls[0][0]
      expect(text).toContain(expectedClause)
      expect(values).toEqual(['id'])
    })

    test('should return empty if no matches', async () => {
      db.query = jest.fn().mockReturnValue({})
      const result = await userClient.getRoUserByDeliusId('id')
      expect(db.query).toHaveBeenCalled()
      expect(result).toBe(null)
    })
  })

  describe('updateRoUser', () => {
    test('should pass in the correct sql and params', async () => {
      await userClient.updateRoUser(
        'nomisId',
        'newNomisId',
        'newDeliusId',
        'first',
        'last',
        'org',
        'role',
        'email',
        'orgEmail',
        'phone',
        'onboarded'
      )

      const call = db.query.mock.calls[0][0]
      expect(call.values).toEqual([
        'nomisId',
        'newNomisId',
        'newDeliusId',
        'first',
        'last',
        'org',
        'role',
        'email',
        'orgEmail',
        'phone',
        'onboarded',
      ])
    })
  })

  describe('deleteRoUser', () => {
    test('should pass in the correct sql and params', async () => {
      const expectedClause = 'delete from staff_ids where nomis_id = $1'

      await userClient.deleteRoUser('nomisId')

      const { text, values } = db.query.mock.calls[0][0]
      expect(text).toContain(expectedClause)
      expect(values).toEqual(['nomisId'])
    })
  })

  describe('addRoUser', () => {
    test('should pass in the correct sql and params', async () => {
      await userClient.addRoUser(
        'nomisId',
        'deliusId',
        'first',
        'last',
        'org',
        'role',
        'email',
        'orgEmail',
        'phone',
        'onboarded'
      )

      const call = db.query.mock.calls[0][0]
      expect(call.values).toEqual([
        'nomisId',
        'deliusId',
        'first',
        'last',
        'org',
        'role',
        'email',
        'orgEmail',
        'phone',
        'onboarded',
      ])
    })
  })

  describe('findRoUsers', () => {
    test('should pass in the correct sql and params with wildcard searchterm', async () => {
      const expectedSelectClause = 'select * from staff_ids'

      const expectedWhereClauses = [
        'upper(nomis_id) like upper($1) or',
        'upper(staff_id) like upper($1) or',
        'upper(first_name) like upper($1) or',
        'upper(last_name) like upper($1) or',
        'upper(organisation) like upper($1) or',
        'upper(job_role) like upper($1) or',
        'upper(email) like upper($1) or',
        'upper(telephone) like upper($1)',
      ]

      const expectedOrderByClause = 'order by nomis_id asc'

      await userClient.findRoUsers('searchTerm')

      const { text, values } = db.query.mock.calls[0][0]
      expect(text).toContain(expectedSelectClause)
      expectedWhereClauses.forEach((clause) => expect(text).toContain(clause))
      expect(text).toContain(expectedOrderByClause)
      expect(values).toEqual(['%searchTerm%'])
    })

    test('should return empty if no matches', async () => {
      db.query = jest.fn().mockReturnValue({})
      const result = await userClient.findRoUsers('id')
      expect(db.query).toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })
})
