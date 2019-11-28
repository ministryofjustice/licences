const { getLabel, getRoAction } = require('../../../../../server/routes/viewModels/taskLists/tasks/bassArea')

describe('bass area task', () => {
  describe('getLabel', () => {
    it('should return Not completed if task not DONE', () => {
      expect(
        getLabel({
          decisions: {},
          tasks: { bassAreaCheck: 'SOMETHING' },
        })
      ).to.equal('Not completed')
    })

    it('should return No specific BASS area requested if bassAreaSpecified = false', () => {
      expect(
        getLabel({
          decisions: { bassAreaSpecified: false },
          tasks: { bassAreaCheck: 'DONE' },
        })
      ).to.equal('No specific BASS area requested')
    })

    it('should return BASS area suitable if decision is true', () => {
      expect(
        getLabel({
          decisions: { bassAreaSpecified: true, bassAreaSuitable: true },
          tasks: { bassAreaCheck: 'DONE' },
        })
      ).to.equal('BASS area suitable')
    })

    it('should return BASS area is not suitable if decision is false', () => {
      expect(
        getLabel({
          decisions: { bassAreaSpecified: true, bassAreaSuitable: false },
          tasks: { bassAreaCheck: 'DONE' },
        })
      ).to.equal('BASS area is not suitable')
    })
  })

  describe('getRoAction', () => {
    it('should show btn to bassAreaCheck if bassAreaCheck: UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { bassAreaCheck: 'UNSTARTED' },
        })
      ).to.eql({
        text: 'Start now',
        href: '/hdc/bassReferral/bassAreaCheck/',
        type: 'btn',
      })
    })

    it('should show change link to bassAreaCheck if bassAreaCheck: DONE', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { bassAreaCheck: 'DONE' },
        })
      ).to.eql({
        text: 'Change',
        href: '/hdc/bassReferral/bassAreaCheck/',
        type: 'link',
      })
    })

    it('should show continue btn to bassAreaCheck if bassAreaCheck: !DONE || UNSTARTED', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { bassAreaCheck: 'SOMETHING' },
        })
      ).to.eql({
        text: 'Continue',
        href: '/hdc/bassReferral/bassAreaCheck/',
        type: 'btn',
      })
    })

    it('should show change link to Bass area check if approvedPremisesAddress: DONE, irrespective of value in bassAreaCheck', () => {
      expect(
        getRoAction({
          decisions: {},
          tasks: { approvedPremisesAddress: 'DONE', bassAreaCheck: 'SOMETHING' },
        })
      ).to.eql({
        text: 'Change',
        href: '/hdc/bassReferral/bassAreaCheck/',
        type: 'link',
      })
    })
  })
})
