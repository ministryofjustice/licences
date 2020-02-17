const EventPublisher = require('../../../server/services/notifications/eventPublisher')

describe('EventPublisher', () => {
  const submissionTarget = { some: 'target' }
  const audit = {
    record: jest.fn(),
  }

  describe('With application insights enabled', () => {
    const client = {
      trackEvent: jest.fn(),
    }
    const applicationInsights = {
      defaultClient: client,
    }

    test('audits action', async () => {
      const eventPublisher = new EventPublisher(audit, applicationInsights)

      await eventPublisher.raiseCaseHandover({
        username: 'BOB',
        bookingId: 2,
        transitionType: 'caToRo',
        submissionTarget,
        source: { type: 'prison', aaa: 'aa1', bbb: 1 },
        target: { type: 'probation', aaa: 'aa2', bbb: 2 },
      })

      expect(audit.record).toHaveBeenCalledWith('SEND', 'BOB', {
        bookingId: 2,
        submissionTarget: { some: 'target' },
        transitionType: 'caToRo',
        source: { type: 'prison', aaa: 'aa1', bbb: 1 },
        target: { type: 'probation', aaa: 'aa2', bbb: 2 },
      })
    })

    test('raises event', async () => {
      const eventPublisher = new EventPublisher(audit, applicationInsights)

      await eventPublisher.raiseCaseHandover({
        username: 'BOB',
        bookingId: 2,
        transitionType: 'caToRo',
        submissionTarget,
        source: { type: 'prison', aaa: 'aa1', bbb: 1 },
        target: { type: 'probation', aaa: 'aa2', bbb: 2 },
      })

      expect(client.trackEvent).toHaveBeenCalledWith({
        name: 'CaseHandover',
        properties: {
          bookingId: 2,
          transitionType: 'caToRo',
          source_type: 'prison',
          source_aaa: 'aa1',
          source_bbb: 1,
          target_type: 'probation',
          target_aaa: 'aa2',
          target_bbb: 2,
        },
      })
    })
  })

  describe('With application insights disabled', () => {
    const applicationInsights = null

    test('audits action', async () => {
      const eventPublisher = new EventPublisher(audit, applicationInsights)

      await eventPublisher.raiseCaseHandover({
        username: 'BOB',
        bookingId: 2,
        transitionType: 'caToRo',
        submissionTarget,
        source: { type: 'prison', aaa: 'aa1', bbb: 1 },
        target: { type: 'probation', aaa: 'aa2', bbb: 2 },
      })

      expect(audit.record).toHaveBeenCalledWith('SEND', 'BOB', {
        bookingId: 2,
        submissionTarget: { some: 'target' },
        transitionType: 'caToRo',
        source: { type: 'prison', aaa: 'aa1', bbb: 1 },
        target: { type: 'probation', aaa: 'aa2', bbb: 2 },
      })
    })

    test('does not raise event', async () => {
      const eventPublisher = new EventPublisher(audit, applicationInsights)

      await eventPublisher.raiseCaseHandover('BOB', 2, 'caToRo', submissionTarget)

      // no error thrown
    })
  })
})
