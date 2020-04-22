const nock = require('nock')

const config = require('../../server/config')
const { createProbationTeamsClient } = require('../../dist/server/data/probationTeamsClient')

describe('probationTeamsClient', () => {
  let fakeProbationTeamsService
  let probationTeamsClient
  let signInService

  beforeEach(() => {
    fakeProbationTeamsService = nock(`${config.probationTeams.apiUrl}`)
    signInService = {
      getAnonymousClientCredentialsTokens: jest.fn().mockReturnValue('token'),
    }
    probationTeamsClient = createProbationTeamsClient(signInService)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('probationTeamsClient', () => {
    test('should throw error on GET when no token', async () => {
      signInService.getAnonymousClientCredentialsTokens.mockResolvedValue(null)
      await expect(probationTeamsClient.getFunctionalMailbox('AREA_CODE', 'LDU_CODE', 'TEAM_CODE')).rejects.toThrow(
        /Failed to get token when attempting to GET probationTeamsService: .*?\/probation-areas\/AREA_CODE\/local-delivery-units\/LDU_CODE/
      )
    })

    describe('getFunctionalMailbox', () => {
      test('should return data from api', async () => {
        fakeProbationTeamsService
          .get('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE')
          .reply(
            200,
            '{"probationAreaCode": "AREA_CODE","localDeliveryUnitCode":"LDU_CODE","functionalMailbox":"user@email.com", "probationTeams":{}}',
            { 'Content-Type': 'application/json' }
          )

        await expect(
          probationTeamsClient.getFunctionalMailbox('AREA_CODE', 'LDU_CODE', 'TEAM_CODE')
        ).resolves.toStrictEqual('user@email.com')
      })

      test('should return data from probationTeams', async () => {
        fakeProbationTeamsService
          .get('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE')
          .reply(
            200,
            '{"probationAreaCode": "AREA_CODE","localDeliveryUnitCode":"LDU_CODE","functionalMailbox":"user@email.com", "probationTeams":{ "TEAM_CODE":{"functionalMailbox":"team@email.com"}}}',
            { 'Content-Type': 'application/json' }
          )

        await expect(
          probationTeamsClient.getFunctionalMailbox('AREA_CODE', 'LDU_CODE', 'TEAM_CODE')
        ).resolves.toStrictEqual('team@email.com')
      })

      test('should return correct functionalMailbox when teamCode does not select a probation team', async () => {
        fakeProbationTeamsService
          .get('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE')
          .reply(
            200,
            '{"probationAreaCode": "AREA_CODE","localDeliveryUnitCode":"LDU_CODE","functionalMailbox":"user@email.com", "probationTeams":{ "TEAM_CODE":{"functionalMailbox":"team@email.com"}}}',
            { 'Content-Type': 'application/json' }
          )

        await expect(
          probationTeamsClient.getFunctionalMailbox('AREA_CODE', 'LDU_CODE', 'TEAM2_CODE')
        ).resolves.toStrictEqual('user@email.com')
      })

      test('should return correct functionalMailbox when teamCode is undefined', async () => {
        fakeProbationTeamsService
          .get('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE')
          .reply(
            200,
            '{"probationAreaCode": "AREA_CODE","localDeliveryUnitCode":"LDU_CODE","functionalMailbox":"user@email.com", "probationTeams":{ "TEAM_CODE":{"functionalMailbox":"team@email.com"}}}',
            { 'Content-Type': 'application/json' }
          )

        await expect(
          probationTeamsClient.getFunctionalMailbox('AREA_CODE', 'LDU_CODE', undefined)
        ).resolves.toStrictEqual('user@email.com')
      })

      test('should reject if api fails', async () => {
        fakeProbationTeamsService.get('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE').reply(500)

        await expect(
          probationTeamsClient.getFunctionalMailbox('AREA_CODE', 'LDU_CODE', 'TEAM_CODE')
        ).rejects.toStrictEqual(Error('Internal Server Error'))
      })

      test('should return null on 404', async () => {
        fakeProbationTeamsService.get('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE').reply(404)

        await expect(
          probationTeamsClient.getFunctionalMailbox('AREA_CODE', 'LDU_CODE', 'TEAM_CODE')
        ).resolves.toStrictEqual(null)
      })
    })
  })

  describe('getProbationArea', () => {
    test('Should return probation area resource', async () => {
      fakeProbationTeamsService
        .get('/probation-areas/AREA_CODE')
        .reply(200, '{ "probationAreaCode": "AREA_CODE","localDeliveryUnits":{}}', {
          'Content-Type': 'application/json',
        })

      await expect(probationTeamsClient.getProbationArea('AREA_CODE')).resolves.toEqual({
        probationAreaCode: 'AREA_CODE',
        localDeliveryUnits: {},
      })
    })

    test('Should reject when api fails', async () => {
      fakeProbationTeamsService.get('/probation-areas/AREA_CODE').reply(500)
      await expect(probationTeamsClient.getProbationArea('AREA_CODE')).rejects.toThrowError('Internal Server Error')
    })
  })

  describe('setLduFunctionalMailbox', () => {
    test('Should PUT FMB', async () => {
      fakeProbationTeamsService
        .put('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE/functional-mailbox', '"a@b.com"')
        .reply(201)

      await expect(
        probationTeamsClient.setLduFunctionalMailbox('token', 'AREA_CODE', 'LDU_CODE', 'a@b.com')
      ).resolves.toBeUndefined()
    })

    test('Should reject when api fails', async () => {
      fakeProbationTeamsService
        .put('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE/functional-mailbox', '"a@b.com"')
        .reply(500)

      await expect(
        probationTeamsClient.setLduFunctionalMailbox('token', 'AREA_CODE', 'LDU_CODE', 'a@b.com')
      ).rejects.toThrowError('Internal Server Error')
    })
  })

  describe('setProbationTeamFunctionalMailbox', () => {
    test('Should PUT FMB', async () => {
      fakeProbationTeamsService
        .put('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE/teams/TEAM_CODE/functional-mailbox', '"a@b.com"')
        .reply(201)

      await expect(
        probationTeamsClient.setProbationTeamFunctionalMailbox('token', 'AREA_CODE', 'LDU_CODE', 'TEAM_CODE', 'a@b.com')
      ).resolves.toBeUndefined()
    })

    test('Should reject when api fails', async () => {
      fakeProbationTeamsService
        .put('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE/teams/TEAM_CODE/functional-mailbox', '"a@b.com"')
        .reply(500)

      await expect(
        probationTeamsClient.setProbationTeamFunctionalMailbox('token', 'AREA_CODE', 'LDU_CODE', 'TEAM_CODE', 'a@b.com')
      ).rejects.toThrowError('Internal Server Error')
    })
  })

  describe('deleteLduFunctionalMailbox', () => {
    test('Should DELETE FMB', async () => {
      fakeProbationTeamsService
        .delete('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE/functional-mailbox')
        .reply(204)

      await expect(
        probationTeamsClient.deleteLduFunctionalMailbox('token', 'AREA_CODE', 'LDU_CODE')
      ).resolves.toBeUndefined()
    })

    test('Should reject when api fails', async () => {
      fakeProbationTeamsService
        .delete('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE/functional-mailbox')
        .reply(500)

      await expect(
        probationTeamsClient.deleteLduFunctionalMailbox('token', 'AREA_CODE', 'LDU_CODE')
      ).rejects.toThrowError('Internal Server Error')
    })
  })

  describe('deleteProbationTeamFunctionalMailbox', () => {
    test('Should DELETE FMB', async () => {
      fakeProbationTeamsService
        .delete('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE/teams/TEAM_CODE/functional-mailbox')
        .reply(204)

      await expect(
        probationTeamsClient.deleteProbationTeamFunctionalMailbox('token', 'AREA_CODE', 'LDU_CODE', 'TEAM_CODE')
      ).resolves.toBeUndefined()
    })

    test('Should reject when api fails', async () => {
      fakeProbationTeamsService
        .delete('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE/teams/TEAM_CODE/functional-mailbox')
        .reply(500)

      await expect(
        probationTeamsClient.deleteProbationTeamFunctionalMailbox('token', 'AREA_CODE', 'LDU_CODE', 'TEAM_CODE')
      ).rejects.toThrowError('Internal Server Error')
    })
  })
})
