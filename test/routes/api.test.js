const request = require('supertest')
const express = require('express')
const moment = require('moment')

const createApiRoute = require('../../server/routes/api')

let reportingService

describe('/api/', () => {
  beforeEach(() => {
    reportingService = createReportingServiceStub()
  })

  describe('address submission', () => {
    test('returns json', () => {
      const app = createApp(reportingService)
      return request(app)
        .get('/api/addressSubmission/')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body.msg).toBe('hello')
        })
    })
  })

  describe('assessmentComplete submission', () => {
    test('returns json', () => {
      const app = createApp(reportingService)
      return request(app)
        .get('/api/assessmentComplete/')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body.assessment).toBe('complete')
        })
    })
  })

  describe('final checks complete', () => {
    test('returns json', () => {
      const app = createApp(reportingService)
      return request(app)
        .get('/api/finalChecksComplete/')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body.finalChecks).toBe('complete')
        })
    })
  })

  describe('decision made', () => {
    test('returns json', () => {
      const app = createApp(reportingService)
      return request(app)
        .get('/api/decisionMade/')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body.approval).toBe('complete')
        })
    })

    test('uses start and end query parameters', () => {
      const app = createApp(reportingService)
      return request(app)
        .get('/api/decisionMade?start=22-11-2017&end=04-09-2018')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(() => {
          expect(reportingService.getApprovalComplete).toHaveBeenCalled()
          expect(reportingService.getApprovalComplete).toHaveBeenCalledWith(
            moment('22-11-2017', 'DD-MM-YYYY'),
            moment('04-09-2018', 'DD-MM-YYYY').set({ hour: 23, minute: 59 })
          )
        })
    })

    test('returns a bad request if invalid date used', () => {
      const app = createApp(reportingService)
      return request(app)
        .get('/api/decisionMade?start=22-13-2017&end=04-09-2018')
        .expect('Content-Type', /json/)
        .expect(400)
        .then((response) => {
          expect(response.body.message).toBe('Invalid date format')
        })
    })
  })

  describe('unknown report', () => {
    test('returns 404', () => {
      const app = createApp(reportingService)
      return request(app).get('/api/somethingElse/').expect('Content-Type', /json/).expect(404)
    })
  })
})

function createApp(service = reportingService) {
  const route = createApiRoute({ reportingService: service })

  const app = express()
  app.use('/api/', route)

  return app
}

const createReportingServiceStub = () => ({
  getAddressSubmission: jest.fn().mockReturnValue({ msg: 'hello' }),
  getAssessmentComplete: jest.fn().mockReturnValue({ assessment: 'complete' }),
  getFinalChecksComplete: jest.fn().mockReturnValue({ finalChecks: 'complete' }),
  getApprovalComplete: jest.fn().mockReturnValue({ approval: 'complete' }),
})
