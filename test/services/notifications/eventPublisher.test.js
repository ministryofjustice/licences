const { TelemetryClient } = require('applicationinsights')
const EventPublisher = require('../../../server/services/notifications/eventPublisher')

describe('EventPublisher', () => {
  const submissionTarget = { some: 'target' }
  /** @type {any} */
  const audit = {
    record: jest.fn(),
  }

  describe('With application insights enabled', () => {
    /** @type {TelemetryClient} */
    // @ts-ignore
    const telemetryClient = {
      trackEvent: jest.fn(),
    }

    test('audits action', async () => {
      const eventPublisher = new EventPublisher(audit, telemetryClient)

      await eventPublisher.raiseCaseHandover({
        username: 'TEST',
        bookingId: '2',
        transitionType: 'caToRo',
        submissionTarget,
        source: { type: 'prison', probationAreaCode: 'aa1', lduCode: '1' },
        target: { type: 'probation', probationAreaCode: 'aa2', lduCode: '2' },
      })

      expect(audit.record).toHaveBeenCalledWith('SEND', 'TEST', {
        bookingId: '2',
        submissionTarget: { some: 'target' },
        transitionType: 'caToRo',
        source: { type: 'prison', probationAreaCode: 'aa1', lduCode: '1' },
        target: { type: 'probation', probationAreaCode: 'aa2', lduCode: '2' },
      })
    })

    test('raises event', async () => {
      const eventPublisher = new EventPublisher(audit, telemetryClient)

      await eventPublisher.raiseCaseHandover({
        username: 'TEST',
        bookingId: '2',
        transitionType: 'caToRo',
        submissionTarget,
        source: { type: 'prison', probationAreaCode: 'aa1', lduCode: '1' },
        target: { type: 'probation', probationAreaCode: 'aa2', lduCode: '2' },
      })

      expect(telemetryClient.trackEvent).toHaveBeenCalledWith({
        name: 'CaseHandover',
        properties: {
          bookingId: '2',
          transitionType: 'caToRo',
          source_type: 'prison',
          source_probationAreaCode: 'aa1',
          source_lduCode: '1',
          target_type: 'probation',
          target_probationAreaCode: 'aa2',
          target_lduCode: '2',
        },
      })
    })
  })

  describe('With application insights disabled', () => {
    const applicationInsights = null

    test('audits action', async () => {
      const eventPublisher = new EventPublisher(audit, applicationInsights)

      await eventPublisher.raiseCaseHandover({
        username: 'TEST',
        bookingId: '2',
        transitionType: 'caToRo',
        submissionTarget,
        source: { type: 'prison', probationAreaCode: 'aa1', lduCode: '1' },
        target: { type: 'probation', probationAreaCode: 'aa2', lduCode: '2' },
      })

      expect(audit.record).toHaveBeenCalledWith('SEND', 'TEST', {
        bookingId: '2',
        submissionTarget: { some: 'target' },
        transitionType: 'caToRo',
        source: { type: 'prison', probationAreaCode: 'aa1', lduCode: '1' },
        target: { type: 'probation', probationAreaCode: 'aa2', lduCode: '2' },
      })
    })

    test('does not raise event', async () => {
      const eventPublisher = new EventPublisher(audit, applicationInsights)

      await eventPublisher.raiseCaseHandover({
        username: 'TEST',
        bookingId: '2',
        transitionType: 'caToRo',
        submissionTarget,
        source: { type: 'prison', probationAreaCode: 'aa1', lduCode: '1' },
        target: { type: 'probation', probationAreaCode: 'aa2', lduCode: '2' },
      })

      // no error thrown
    })
  })
})
