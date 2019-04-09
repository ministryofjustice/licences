const proxyquire = require('proxyquire')

proxyquire.noCallThru()

describe('userClient', () => {
  let queryStub

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
  const userProxy = (query = queryStub) => {
    return proxyquire('../../server/data/userClient', {
      './dataAccess/db': {
        query,
      },
    })
  }

  beforeEach(() => {
    queryStub = sinon.stub().resolves(standardResponse)
  })

  describe('getRoUsers', () => {
    it('should call query', () => {
      userProxy().getRoUsers()
      expect(queryStub).to.have.callCount(1)
    })
  })

  describe('getIncompleteRoUsers', () => {
    const incompleteUsers = {
      rows: [
        {
          first_name: 1,
          last_name: 2,
          mapped: 3,
          auth_onboarded: 4,
          nomis_id: 5,
          sent_timestamp: '2019-01-01',
          booking_id: 7,
          sent_staffcode: 8,
          sent_name: 9,
        },
      ],
    }

    beforeEach(() => {
      queryStub = sinon.stub().resolves(incompleteUsers)
    })

    it('should call query', () => {
      userProxy().getIncompleteRoUsers()
      expect(queryStub).to.have.callCount(1)
    })

    it('should convert results', async () => {
      const converted = [
        {
          first: 1,
          last: 2,
          mapped: 3,
          onboarded: 4,
          nomisId: 5,
          sent: '01/01/2019',
          bookingId: 7,
          sentStaffCode: 8,
          sentName: 9,
        },
      ]
      const results = await userProxy().getIncompleteRoUsers()
      expect(queryStub).to.have.callCount(1)
      expect(results).to.eql(converted)
    })
  })

  describe('getRoUser', () => {
    it('should call query', () => {
      userProxy().getRoUser('id')
      expect(queryStub).to.have.callCount(1)
    })

    it('should pass in the correct sql and params', () => {
      const expectedClause = 'where nomis_id = $1'

      const result = userProxy().getRoUser('id')

      return result.then(() => {
        const call = queryStub.getCalls()[0].args[0]
        expect(call.text).includes(expectedClause)
        expect(call.values).to.eql(['id'])
      })
    })
  })

  describe('getRoUserByDeliusId', () => {
    it('should call query', () => {
      userProxy().getRoUserByDeliusId('id')
      expect(queryStub).to.have.callCount(1)
    })

    it('should pass in the correct sql and params', () => {
      const expectedClause = 'where staff_id = $1'

      const result = userProxy().getRoUserByDeliusId('id')

      return result.then(() => {
        const call = queryStub.getCalls()[0].args[0]
        expect(call.text).includes(expectedClause)
        expect(call.values).to.eql(['id'])
      })
    })
  })

  describe('updateRoUser', () => {
    it('should pass in the correct sql and params', () => {
      const result = userProxy().updateRoUser(
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

      return result.then(() => {
        const call = queryStub.getCalls()[0].args[0]
        expect(call.values).to.eql([
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
  })

  describe('deleteRoUser', () => {
    it('should pass in the correct sql and params', () => {
      const expectedClause = 'delete from staff_ids where nomis_id = $1'

      const result = userProxy().deleteRoUser('nomisId')

      return result.then(() => {
        const call = queryStub.getCalls()[0].args[0]
        expect(call.text).includes(expectedClause)
        expect(call.values).to.eql(['nomisId'])
      })
    })
  })

  describe('addRoUser', () => {
    it('should pass in the correct sql and params', () => {
      const result = userProxy().addRoUser(
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

      return result.then(() => {
        const call = queryStub.getCalls()[0].args[0]
        expect(call.values).to.eql([
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
  })

  describe('findRoUsers', () => {
    it('should pass in the correct sql and params with wildcard searchterm', () => {
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

      const result = userProxy().findRoUsers('searchTerm')

      return result.then(() => {
        const call = queryStub.getCalls()[0].args[0]
        expect(call.text).includes(expectedSelectClause)
        expectedWhereClauses.forEach(clause => expect(call.text).includes(clause))
        expect(call.text).includes(expectedOrderByClause)
        expect(call.values).to.eql(['%searchTerm%'])
      })
    })
  })
})
