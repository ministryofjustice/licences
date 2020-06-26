export interface Result<S, E> {
  success(): S
  fail(): E
  map<T>(f: (v: S) => T): Result<T, E>
  mapAsync<T>(f: (v: S) => Promise<T>): Promise<Result<T, E>>
  orRecoverAsync(f: () => Promise<Result<S, E>>): Promise<Result<S, E>>
  flatMap<T>(f: (v: S) => Result<T, E>): Result<T, E>
  match<T>(successFunction: (v: S) => T, failFunction: (v: E) => T): T
  isSuccess(): boolean
}

export const Success = <S, E>(value: S): Result<S, E> => ({
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

export const Fail = <S, E>(error: E): Result<S, E> => ({
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
