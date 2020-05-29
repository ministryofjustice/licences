import { buildErrorHandler, RequestError, ResponseError } from '../../server/data/clientErrorHandler'
import logger from '../../log'

describe('clientErrorHandler', () => {
  const API_NAME = 'Elite 2 API'
  const handleError = buildErrorHandler(API_NAME)
  const warnSpy = jest.spyOn(logger, 'warn')

  afterEach(() => {
    warnSpy.mockClear()
  })

  it("handles a 'ClientError", () => {
    const error = Error('Generic')
    error.message = 'Message'

    expect(() => handleError(error, '/a/b')).toThrow('Message')
    expect(warnSpy).toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith(`Error calling ${API_NAME}, path: '/a/b', verb: 'GET'`, expect.anything())
  })

  it("handles a 'RequestError", () => {
    const error = Error('Generic') as RequestError
    error.message = 'Message'
    error.request = {}
    error.code = 500

    expect(() => handleError(error, '/a/b')).toThrow('Message')
    expect(warnSpy).toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith(
      `Error calling ${API_NAME}, path: '/a/b', verb: 'GET', code: '500'`,
      expect.anything()
    )
  })

  it("handles a 'ResponseError", () => {
    const error = Error('Generic') as ResponseError
    error.message = 'Message'
    error.request = {}
    error.code = 550
    error.response = {
      status: 500,
    }

    expect(() => handleError(error, '/a/b')).toThrow('Message')
    expect(warnSpy).toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith(
      `Error calling ${API_NAME}, path: '/a/b', verb: 'GET', status: '500'`,
      expect.anything()
    )
  })
})
