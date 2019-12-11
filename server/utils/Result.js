const Success = value => ({
  success() {
    return value
  },

  fail() {
    throw new Error('cannot call fail() on a Success')
  },

  map(f) {
    return Success(f(value))
  },

  orElse() {
    return Success(value)
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

const Fail = error => ({
  success() {
    throw new Error('cannot call success() on a Fail')
  },
  fail: () => error,

  map() {
    return Fail(error)
  },

  orElse(resultSource) {
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

module.exports = {
  Success,
  Fail,
}
