import { lduWithTeamsMapToView } from '../../../server/routes/admin/functionalMailboxes'

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
})
