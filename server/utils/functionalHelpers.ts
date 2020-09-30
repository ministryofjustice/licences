import R from 'ramda'

import { Result, Error } from '../../types/licences'

export { flatten, merge, equals, difference, pipe, all, pick, pickBy, keys, intersection, splitEvery } from 'ramda'

export const lastItem = R.last
export const mergeWithRight = R.mergeDeepRight
export const firstItem = R.head
export const removePath = R.dissocPath
export const replacePath = R.assocPath
export const removeFromArray = R.remove

export const addToArray = R.append

export const mapObject = R.mapObjIndexed

export const isEmpty = R.either(R.isEmpty, R.isNil)

// pass in your object and a path in array format
// http://ramdajs.com/docs/#path
export function getIn(object, pathArray) {
  return R.path(pathArray, object)
}

// Curried version of 'getIn' above
export const selectPathsFrom = R.flip(R.path)

export const allValuesEmpty = R.pipe(R.values, R.all(isEmpty))

export function notAllValuesEmpty(object) {
  return !allValuesEmpty(object)
}

export function replaceArrayItem(array, index, item) {
  return R.update(parseInt(index, 10))(item)(array)
}

export function lastIndex(array) {
  return array.length - 1
}

export function removePaths(arrayOfPaths, object) {
  const dissocPath = (initialObject, path) => R.dissocPath(path, initialObject)
  return R.reduce(dissocPath, object)(arrayOfPaths)
}

export function addPaths(arrayOfPathValueTuples, object) {
  const assocPath = (initialObject, tuple) => R.assocPath(tuple[0], tuple[1], initialObject)
  return R.reduce(assocPath, object)(arrayOfPathValueTuples)
}

export function interleave(firstArray, secondArray) {
  return R.flatten(firstArray.map((item, index) => [item, secondArray[index] || ''])).join('')
}

export function getWhereKeyLike(string, object) {
  const stringIncludesKey = (value, key) => {
    const lowerCaseString = string.toLowerCase()
    return lowerCaseString.includes(key.toLowerCase())
  }

  return R.pipe(R.pickBy(stringIncludesKey), R.values, R.head)(object)
}

export const pickKey = (predicate) => R.pipe(R.pickBy(predicate), R.keys, R.head)

export const firstKey = R.pipe(R.keys, R.head)

export function getFieldDetail(fieldPath, fieldConfig) {
  return R.pipe(R.values, R.head, R.path(fieldPath))(fieldConfig)
}

export const getFieldName = firstKey

export function omit(keys, obj) {
  return R.omit(keys, obj)
}

export function isError<T>(result: Result<T>): result is Error {
  return !isEmpty((result as Error)?.message)
}

export function unwrapResult<T>(result: Result<T>): [T, undefined] | [undefined, Error] {
  return isError(result) ? [undefined, result] : [result, undefined]
}

export function unwrapResultOrThrow<T>(result: Result<T>, errorMessageBuilder): T {
  if (isError(result)) {
    throw new Error(errorMessageBuilder(result))
  } else {
    return result
  }
}

export function isYes(obj, pathSegments) {
  const answer = getIn(obj, pathSegments)
  return answer ? answer === 'Yes' : false
}

export function isNo(obj, pathSegments) {
  const answer = getIn(obj, pathSegments)
  return answer ? answer === 'No' : false
}

export function sortKeys(o) {
  return Object.keys(o || {})
    .sort()
    .reduce((r, k) => {
      const result = r
      result[k] = o[k]
      return result
    }, {})
}
