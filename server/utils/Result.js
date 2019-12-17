/**
 * @template S, E
 * @returns {import("./ResultTypes").Result<S, E>}
 */
const Success = value => ({
  success() {
    return value
  },

  fail() {
    throw new Error('cannot call fail() on a Success')
  },

  map(f) {
    const result = f(value)
    return Success(result)
  },

  async mapAsync(f) {
    const result = await f(value)
    return Success(result)
  },

  async orRecoverAsync() {
    return this
  },

  flatMap(arrow) {
    return arrow(value)
  },

  match(successFn) {
    return successFn(value)
  },

  isSuccess() {
    return true
  },
})

/**
 * @template S, E
 * @returns {import("./ResultTypes").Result<S, E>}
 */
const Fail = error => ({
  success() {
    throw new Error('cannot call success() on a Fail')
  },
  fail: () => error,

  map() {
    return Fail(error)
  },

  async mapAsync() {
    return Fail(error)
  },

  orRecoverAsync(resultSource) {
    return resultSource()
  },

  flatMap() {
    return Fail(error)
  },

  match(successFn, failFn) {
    return failFn(error)
  },

  isSuccess() {
    return false
  },
})

/**
 * @type {import("./ResultTypes").ResultFactory}
 */
const ResultFactory = {
  Success,
  Fail,
}

module.exports = ResultFactory
