import supertest from 'supertest'
import {
  lduWithTeamsMapToView,
  validateLduFmb,
  functionalMailboxRouter,
} from '../../../server/routes/admin/functionalMailboxes'

const { startRoute } = require('../../supertestSetup')

describe('functionalMailboxes router', () => {
  describe('toViewData', () => {
    it('Empty map: empty view', () => {
      expect(lduWithTeamsMapToView({})).toEqual([])
    })

    it('Single LDU', () => {
      expect(
        lduWithTeamsMapToView({
          A: {
            description: 'An A',
            functionalMailbox: 'a@b.com',
            probationTeams: {},
          },
        })
      ).toEqual([{ code: 'A', description: 'An A', functionalMailbox: 'a@b.com', probationTeams: [] }])
    })

    it('LDUs, optional data', () => {
      expect(
        lduWithTeamsMapToView({
          A: {
            description: 'An A',
            functionalMailbox: 'a@b.com',
            probationTeams: {},
          },
          B: {
            functionalMailbox: 'b@b.com',
            probationTeams: {},
          },
          C: {
            description: 'A C',
            probationTeams: {},
          },
          D: {
            functionalMailbox: 'd@b.com',
            probationTeams: {},
          },
        })
      ).toEqual([
        { code: 'B', functionalMailbox: 'b@b.com', probationTeams: [] },
        { code: 'D', functionalMailbox: 'd@b.com', probationTeams: [] },
        { code: 'C', description: 'A C', probationTeams: [] },
        { code: 'A', description: 'An A', functionalMailbox: 'a@b.com', probationTeams: [] },
      ])
    })

    it('LDU with probation teams: teams sorted correctly', () => {
      expect(
        lduWithTeamsMapToView({
          A: {
            probationTeams: {
              W: { description: 'The W' },
              X: { functionalMailbox: 'x@b.com' },
              Y: { description: 'A Y' },
              Z: {},
            },
          },
        })
      ).toEqual([
        {
          code: 'A',
          probationTeams: [
            { code: 'X', functionalMailbox: 'x@b.com' },
            { code: 'Z' },
            { code: 'Y', description: 'A Y' },
            { code: 'W', description: 'The W' },
          ],
        },
      ])
    })
  })
  describe('lduFmbSchema', () => {
    it('accepts valid values', () => {
      const { error, value } = validateLduFmb('ABCDEFGHIJ', 'VW_XYZ123', 'a@b.com')
      expect(error).toBeNull()
      expect(value).toEqual({
        probationAreaCode: 'ABCDEFGHIJ',
        lduCode: 'VW_XYZ123',
        functionalMailbox: 'a@b.com',
      })
    })

    it('accepts empty fmb', () => {
      const { error, value } = validateLduFmb('A', 'B', '')
      expect(error).toBeNull()
      expect(value).toEqual({
        probationAreaCode: 'A',
        lduCode: 'B',
        functionalMailbox: '',
      })
    })

    it('reject invalid fmb', () => {
      const { error, value } = validateLduFmb('A', 'B', 'abcd123')
      expect(error.details[0]).toEqual(
        expect.objectContaining({ message: '"Functional Mailbox" must be a valid email', path: ['functionalMailbox'] })
      )
      expect(value).toEqual({ functionalMailbox: 'abcd123', lduCode: 'B', probationAreaCode: 'A' })
    })

    it('reject invalid codes', () => {
      const { error, value } = validateLduFmb('A B', 'A*B', 'abc@def.com')
      expect(error.details).toEqual([
        expect.objectContaining({
          message: '"probationAreaCode" with value "A B" fails to match the required pattern: /^[0-9A-Z_]{1,10}$/',
          path: ['probationAreaCode'],
        }),
        expect.objectContaining({
          message: '"lduCode" with value "A*B" fails to match the required pattern: /^[0-9A-Z_]{1,10}$/',
          path: ['lduCode'],
        }),
      ])
    })

    it('trims space', () => {
      const { value } = validateLduFmb(' A ', '  B ', '  abc@def.com ')
      expect(value).toEqual({ functionalMailbox: 'abc@def.com', lduCode: 'B', probationAreaCode: 'A' })
    })
  })

  describe('router', () => {
    let functionalMailboxService

    const createApp = (user) =>
      startRoute(functionalMailboxRouter(functionalMailboxService), '/admin/functionalMailboxes', user, undefined)

    beforeEach(() => {
      functionalMailboxService = {
        getAllProbationAreas: jest.fn(),
        getLdusForProbationArea: jest.fn(),
        getLduWithProbationTeams: jest.fn(),
        updateLduFunctionalMailbox: jest.fn(),
        updateProbationTeamFunctionalMailbox: jest.fn(),
      }
    })

    it('/probationAreas/{probationAreaCode}/ldus', () => {
      functionalMailboxService.getLdusForProbationArea.mockResolvedValue({
        L_A: { description: 'LA', functionalMailbox: 'a@b.com' },
        L_B: { description: 'LB', functionalMailbox: 'b@b.com' },
      })

      return supertest(createApp('batchUser'))
        .get('/admin/functionalMailboxes/probationAreas/PA/ldus')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('LA (L_A)')
          expect(res.text).toContain('LB (L_B)')
        })
    })

    it('/probationAreas/{probationAreaCode}/ldus/{lduCode}', async () => {
      functionalMailboxService.getLduWithProbationTeams.mockResolvedValue({
        description: 'LDU A',
        functionalMailbox: 'a@b.com',
        probationTeams: {
          T_A: { description: 'Team A', functionalMailbox: 'ta@b.com' },
          T_B: { functionalMailbox: 'tb@b.com' },
          T_C: {},
        },
      })

      await supertest(createApp('batchUser'))
        .get('/admin/functionalMailboxes/probationAreas/PA/ldus/L_A')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toContain('LDU A (L_A)')
        })

      expect(functionalMailboxService.getLduWithProbationTeams).toHaveBeenCalledWith({
        probationAreaCode: 'PA',
        lduCode: 'L_A',
      })
    })
  })
})
