import { getRoTasksPostApproval } from '../../../../server/routes/viewModels/taskLists/roTasks'
const logger = require('../../../../log')
describe('roTasks', () => {
  describe('standard task list', () => {
    const infoSpy = jest.spyOn(logger, 'info')

    afterEach(() => {
      infoSpy.mockClear()
    })

    test('getRoTasksPostApproval info logger', () => {
      getRoTasksPostApproval({
        decisions: {},
        tasks: {},
      })
      expect(infoSpy).toHaveBeenCalledWith('getRoTasksPostApproval task list accessed')
    })
  })
})
