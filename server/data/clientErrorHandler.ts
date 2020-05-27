import R from 'ramda'
import logger from '../../log'

interface ClientError extends Error {
  message: string
  stack: any
}

interface RequestError extends ClientError {
  request: any
  code: number
}

interface ResponseError extends ClientError {
  response: {
    status: number
  }
}

const isRequestError = (error: Error): error is RequestError => R.hasPath(['request', 'code'], error as RequestError)

const isResponseError = (error: Error): error is ResponseError =>
  R.hasPath(['request', 'status'], error as ResponseError)

/**
 * Build a function that
 * logs the error excluding sensitive information
 * @param apiName A friendly name for the API that will be included in log statements.
 */
export const buildErrorLogger = (apiName: string) => (error: ClientError, path: string, verb: string = 'GET'): void => {
  if (isResponseError(error)) {
    logger.warn(
      `Error calling ${apiName}, path: '${path}', verb: '${verb}', status: ${error.response.status}`,
      error.stack
    )
  } else if (isRequestError(error)) {
    logger.warn(`Error calling ${apiName}, path: '${path}', verb: '${verb}', code: '${error.code}'`, error.stack)
  } else {
    logger.warn(`Error calling ${apiName}, path: '${path}', verb: '${verb}'`, error.stack)
  }
}

/**
 * Build a function that
 * logs the error excluding sensitive information then throws a new Error containing the original Error's message (only)
 * @param apiName A friendly name for the API that will be included in log statements.
 */
export const buildErrorHandler = (apiName: string) => {
  const logError = buildErrorLogger(apiName)
  return (error: ClientError, path: string, verb: string = 'GET'): never => {
    logError(error, path, verb)
    throw Error(error.message)
  }
}
