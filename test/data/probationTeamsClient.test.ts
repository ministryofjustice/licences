import nock from 'nock'

import config from '../../server/config'
import { buildRestClient, clientCredentialsTokenSource } from '../../server/data/restClientBuilder'
import { ProbationTeamsClient } from '../../server/data/probationTeamsClient'

const LDU_ID = Object.freeze({ probationAreaCode: 'AREA_CODE', lduCode: 'LDU_CODE' })

const PROBATION_TEAM_ID = Object.freeze({ probationAreaCode: 'AREA_CODE', lduCode: 'LDU_CODE', teamCode: 'TEAM_CODE' })

describe('probationTeamsClient', () => {
  let fakeProbationTeamsService
  let probationTeamsClient
  let signInService

  beforeEach(() => {
    fakeProbationTeamsService = nock(`${config.probationTeams.apiUrl}`)
    signInService = {
      getAnonymousClientCredentialsTokens: jest.fn().mockResolvedValue('token'),
    }
    const restClient = buildRestClient(
      clientCredentialsTokenSource(signInService, 'probationTeams'),
      config.probationTeams.apiUrl,
      'probation-teams',
      {
        timeout: {
          response: 1000,
          deadline: 1500,
        },
        agent: config.probationTeams.agent,
      }
    )
    probationTeamsClient = new ProbationTeamsClient(restClient)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('probationTeamsClient', () => {
    test('should throw error on GET when no token', async () => {
      signInService.getAnonymousClientCredentialsTokens.mockResolvedValue(null)
      await expect(probationTeamsClient.getFunctionalMailbox(PROBATION_TEAM_ID)).rejects.toThrow(
        'Error obtaining OAuth token'
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

        await expect(probationTeamsClient.getFunctionalMailbox(PROBATION_TEAM_ID)).resolves.toStrictEqual(
          'user@email.com'
        )
      })

      test('should return data from probationTeams', async () => {
        fakeProbationTeamsService
          .get('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE')
          .reply(
            200,
            '{"probationAreaCode": "AREA_CODE","localDeliveryUnitCode":"LDU_CODE","functionalMailbox":"user@email.com", "probationTeams":{ "TEAM_CODE":{"functionalMailbox":"team@email.com"}}}',
            { 'Content-Type': 'application/json' }
          )

        await expect(probationTeamsClient.getFunctionalMailbox(PROBATION_TEAM_ID)).resolves.toStrictEqual(
          'team@email.com'
        )
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
          probationTeamsClient.getFunctionalMailbox({ ...PROBATION_TEAM_ID, teamCode: 'TEAM_CODE2' })
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
          probationTeamsClient.getFunctionalMailbox({ ...PROBATION_TEAM_ID, teamCode: undefined })
        ).resolves.toStrictEqual('user@email.com')
      })

      test('should reject if api fails', async () => {
        fakeProbationTeamsService.get('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE').times(3).reply(500)

        await expect(probationTeamsClient.getFunctionalMailbox(PROBATION_TEAM_ID)).rejects.toStrictEqual(
          Error('Internal Server Error')
        )
      })

      test('should return null on 404', async () => {
        fakeProbationTeamsService.get('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE').reply(404)

        await expect(probationTeamsClient.getFunctionalMailbox(PROBATION_TEAM_ID)).resolves.toBeUndefined()
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
      fakeProbationTeamsService.get('/probation-areas/AREA_CODE').times(3).reply(500)
      await expect(probationTeamsClient.getProbationArea('AREA_CODE')).rejects.toThrow('Internal Server Error')
    })
  })

  describe('setLduFunctionalMailbox', () => {
    test('Should PUT FMB', async () => {
      fakeProbationTeamsService
        .put('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE/functional-mailbox', '"a@b.com"')
        .reply(201)

      await expect(probationTeamsClient.setLduFunctionalMailbox(LDU_ID, 'a@b.com')).resolves.toBeUndefined()
    })

    test('Should reject when api fails', async () => {
      fakeProbationTeamsService
        .put('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE/functional-mailbox', '"a@b.com"')
        .reply(500)

      await expect(probationTeamsClient.setLduFunctionalMailbox(LDU_ID, 'a@b.com')).rejects.toThrow(
        'Internal Server Error'
      )
    })
  })

  describe('setProbationTeamFunctionalMailbox', () => {
    test('Should PUT FMB', async () => {
      fakeProbationTeamsService
        .put('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE/teams/TEAM_CODE/functional-mailbox', '"a@b.com"')
        .reply(201)

      await expect(
        probationTeamsClient.setProbationTeamFunctionalMailbox(PROBATION_TEAM_ID, 'a@b.com')
      ).resolves.toBeUndefined()
    })

    test('Should reject when api fails', async () => {
      fakeProbationTeamsService
        .put('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE/teams/TEAM_CODE/functional-mailbox', '"a@b.com"')
        .reply(500)

      await expect(
        probationTeamsClient.setProbationTeamFunctionalMailbox(PROBATION_TEAM_ID, 'a@b.com')
      ).rejects.toThrow('Internal Server Error')
    })
  })

  describe('deleteLduFunctionalMailbox', () => {
    test('Should DELETE FMB', async () => {
      fakeProbationTeamsService
        .delete('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE/functional-mailbox')
        .reply(204)

      await expect(probationTeamsClient.deleteLduFunctionalMailbox(LDU_ID)).resolves.toBeUndefined()
    })

    test('Should reject when api fails', async () => {
      fakeProbationTeamsService
        .delete('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE/functional-mailbox')
        .reply(500)

      await expect(probationTeamsClient.deleteLduFunctionalMailbox(LDU_ID)).rejects.toThrow(
        'Internal Server Error'
      )
    })
  })

  describe('deleteProbationTeamFunctionalMailbox', () => {
    test('Should DELETE FMB', async () => {
      fakeProbationTeamsService
        .delete('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE/teams/TEAM_CODE/functional-mailbox')
        .reply(204)

      await expect(
        probationTeamsClient.deleteProbationTeamFunctionalMailbox(PROBATION_TEAM_ID)
      ).resolves.toBeUndefined()
    })

    test('Should reject when api fails', async () => {
      fakeProbationTeamsService
        .delete('/probation-areas/AREA_CODE/local-delivery-units/LDU_CODE/teams/TEAM_CODE/functional-mailbox')
        .reply(500)

      await expect(probationTeamsClient.deleteProbationTeamFunctionalMailbox(PROBATION_TEAM_ID)).rejects.toThrow(
        'Internal Server Error'
      )
    })
  })
})
