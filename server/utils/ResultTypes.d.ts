export interface Result<S, E> {
  value(): S
  error(): E
  map<T>(f: (v: S) => T): Result<T, E>
  orElse(f: () => Result<S, E>): Result<S, E>
  flatMap<T>(f: (v: S) => Result<T, E>): Result<T, E>
  match<T>(sf: (v: S) => T, ff: (v: E) => T): T
  isSuccess(): boolean
}

export interface SuccessFactory<S, E> {
  (value: S): Result<S, E>
}

export interface FailFactory<S, E> {
  (error: E): Result<S, E>
}

export interface ResultFactory<S, E> {
  Success: SuccessFactory<S, E>
  Fail: FailFactory<S, E>
}
