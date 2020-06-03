import nock from 'nock'
import { unauthorisedError } from '../../server/utils/errors'

import logger from '../../log'
import {
  buildRestClient,
  constantTokenSource,
  clientCredentialsTokenSource,
  RestClientConfig,
} from '../../server/data/restClientBuilder'

const BASE_PATH = 'http://www.example.gov.uk'

describe('restClientBuilder', () => {
  describe('buildRestClient', () => {
    const warnSpy = jest.spyOn(logger, 'warn')

    const restConfig: RestClientConfig = {
      timeout: { response: 100, deadline: 200 },
      agent: { maxSockets: 2, maxFreeSockets: 2, freeSocketTimeout: 500 },
    }

    const restClient = buildRestClient(constantTokenSource('t'), BASE_PATH, 'Test API', restConfig)

    let scope

    beforeEach(() => {
      scope = nock(BASE_PATH, {
        reqheaders: { authorization: 'Bearer t', 'accept-encoding': 'gzip, deflate' },
      })
    })

    afterEach(() => {
      warnSpy.mockClear()
      nock.cleanAll()
    })

    describe('getResource', () => {
      it('Normal flow', async () => {
        scope.get('/a-path').reply(200, { answer: 'hello' })
        const result = await restClient.getResource('/a-path')
        expect(result).toEqual({ answer: 'hello' })
        expect(scope.isDone()).toBeTruthy()
      })

      it('500 response', async () => {
        scope.get('/a-path').times(3).reply(500)
        await expect(restClient.getResource('/a-path')).rejects.toThrowError('Internal Server Error')
        expect(scope.isDone()).toBeTruthy()
        expect(warnSpy).toHaveBeenNthCalledWith(
          1,
          "Error calling Test API, path '/a-path', verb: 'GET', status: '500', message: 'cannot GET /a-path (500)'. Retrying..."
        )
        expect(warnSpy).toHaveBeenNthCalledWith(
          2,
          "Error calling Test API, path '/a-path', verb: 'GET', status: '500', message: 'cannot GET /a-path (500)'. Retrying..."
        )
        expect(warnSpy).toHaveBeenNthCalledWith(
          3,
          "Error calling Test API, path: '/a-path', verb: 'GET', status: '500'",
          expect.anything()
        )
        expect(warnSpy).toBeCalledTimes(3)
      })

      it('404 (Not Found) response', async () => {
        scope.get('/a-path').times(1).reply(404)
        const response = await restClient.getResource('/a-path')
        expect(response).toBeUndefined()
        expect(scope.isDone()).toBeTruthy()
        expect(warnSpy).not.toHaveBeenCalled()
      })

      it('401 (Unauthorized) response', async () => {
        scope.get('/a-path').times(1).reply(401)
        await expect(restClient.getResource('/a-path')).rejects.toThrowError(unauthorisedError())
        expect(scope.isDone()).toBeTruthy()

        expect(warnSpy).toHaveBeenCalledWith(
          "Error calling Test API, path: '/a-path', verb: 'GET', status: '401'",
          expect.anything()
        )

        expect(warnSpy).toBeCalledTimes(1)
      })

      it('Error, but no response.', async () => {
        scope.get('/a-path').times(3).replyWithError('Network error')
        await expect(restClient.getResource('/a-path')).rejects.toThrowError('Network error')
        expect(scope.isDone()).toBeTruthy()

        expect(warnSpy).toHaveBeenNthCalledWith(
          1,
          "Error calling Test API, path '/a-path', verb: 'GET', message: 'Network error'. Retrying..."
        )
        expect(warnSpy).toHaveBeenNthCalledWith(
          2,
          "Error calling Test API, path '/a-path', verb: 'GET', message: 'Network error'. Retrying..."
        )
        expect(warnSpy).toHaveBeenNthCalledWith(
          3,
          "Error calling Test API, path: '/a-path', verb: 'GET'",
          expect.anything()
        )

        expect(warnSpy).toBeCalledTimes(3)
      })
    })

    describe('deleteResource', () => {
      it('Normal flow', async () => {
        scope.delete('/a-path').reply(204)
        await restClient.deleteResource('/a-path')
        expect(scope.isDone()).toBeTruthy()
      })

      it('500 response', async () => {
        scope.delete('/a-path').reply(500)
        await expect(restClient.deleteResource('/a-path')).rejects.toThrowError('Internal Server Error')
        expect(scope.isDone()).toBeTruthy()

        expect(warnSpy).toHaveBeenCalledWith(
          "Error calling Test API, path: '/a-path', verb: 'DELETE', status: '500'",
          expect.anything()
        )
        expect(warnSpy).toBeCalledTimes(1)
      })

      it('404 (Not Found) response', async () => {
        scope.delete('/a-path').reply(404)
        await expect(restClient.deleteResource('/a-path')).resolves.toBeUndefined()
        expect(scope.isDone()).toBeTruthy()
        expect(warnSpy).not.toHaveBeenCalled()
      })

      it('401 (Unauthorized) response', async () => {
        scope.delete('/a-path').reply(401)
        await expect(restClient.deleteResource('/a-path')).rejects.toEqual(unauthorisedError())
        expect(scope.isDone()).toBeTruthy()

        expect(warnSpy).toHaveBeenCalledWith(
          "Error calling Test API, path: '/a-path', verb: 'DELETE', status: '401'",
          expect.anything()
        )
        expect(warnSpy).toBeCalledTimes(1)
      })
    })

    describe('putResource', () => {
      it('Normal flow', async () => {
        scope.put('/a-path', { message: 'hello' }).reply(204)
        await restClient.putResource('/a-path', { message: 'hello' })
        expect(scope.isDone()).toBeTruthy()
      })

      it('500 response', async () => {
        scope.put('/a-path', { message: 'hello' }).reply(500)
        await expect(restClient.putResource('/a-path', { message: 'hello' })).rejects.toThrowError(
          'Internal Server Error'
        )
        expect(scope.isDone()).toBeTruthy()

        expect(warnSpy).toHaveBeenCalledWith(
          "Error calling Test API, path: '/a-path', verb: 'PUT', status: '500'",
          expect.anything()
        )
        expect(warnSpy).toBeCalledTimes(1)
      })
    })

    describe('postResource', () => {
      it('Normal flow', async () => {
        scope.post('/a-path', { message: 'hello' }).reply(200, { answer: 'hi' })
        const response = await restClient.postResource('/a-path', { message: 'hello' })
        expect(response).toEqual({ answer: 'hi' })
        expect(scope.isDone()).toBeTruthy()
      })

      it('500 response', async () => {
        scope.post('/a-path', { message: 'hello' }).reply(500)
        await expect(restClient.postResource('/a-path', { message: 'hello' })).rejects.toThrowError(
          'Internal Server Error'
        )
        expect(scope.isDone()).toBeTruthy()

        expect(warnSpy).toHaveBeenCalledWith(
          "Error calling Test API, path: '/a-path', verb: 'POST', status: '500'",
          expect.anything()
        )
        expect(warnSpy).toBeCalledTimes(1)
      })
    })
  })

  describe('dynamicTokenSource', () => {
    it('returns a token', async () => {
      const signInService = { getAnonymousClientCredentialsTokens: jest.fn() }
      signInService.getAnonymousClientCredentialsTokens.mockResolvedValue({ token: 't' })
      const tokenSource = clientCredentialsTokenSource(signInService, 'serviceName')
      expect(await tokenSource()).toEqual('t')
      expect(signInService.getAnonymousClientCredentialsTokens).toHaveBeenCalledWith('serviceName')
    })

    it('throws error on missing token', async () => {
      const signInService = { getAnonymousClientCredentialsTokens: jest.fn() }
      signInService.getAnonymousClientCredentialsTokens.mockResolvedValue({})
      const tokenSource = clientCredentialsTokenSource(signInService, 'serviceName')
      expect(tokenSource()).rejects.toThrow('Error obtaining OAuth token')
    })
  })
})
