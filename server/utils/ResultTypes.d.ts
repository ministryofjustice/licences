export interface Result<S, E> {
  success(): S
  fail(): E
  map<T>(f: (v: S) => T): Result<T, E>
  mapAsync<T>(f: (v: S) => Promise<T>): Promise<Result<T, E>>
  orElseTryAsync(f: () => Promise<this>): Promise<this>
  flatMap<T>(f: (v: S) => Result<T, E>): Result<T, E>
  match<T>(sf: (v: S) => T, ff: (v: E) => T): T
  isSuccess(): boolean
}

export interface SuccessFactory {
  <S, E>(value: S): Result<S, E>
}

export interface FailFactory {
  <S, E>(error: E): Result<S, E>
}

export interface ResultFactory {
  Success: SuccessFactory
  Fail: FailFactory
}
