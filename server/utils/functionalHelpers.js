/**
 * @template T
 * @typedef {import("../../types/licences").Result<T>} Result
 */
/**
 * @typedef {import("../../types/licences").Error} Error
 */
const R = require('ramda')

const isEmpty = R.either(R.isEmpty, R.isNil)

// pass in your object and a path in array format
// http://ramdajs.com/docs/#path
function getIn(object, pathArray) {
  return R.path(pathArray, object)
}

const allValuesEmpty = R.pipe(
  R.values,
  R.all(isEmpty)
)

function notAllValuesEmpty(object) {
  return !allValuesEmpty(object)
}

function replaceArrayItem(array, index, item) {
  return R.update(parseInt(index, 10))(item)(array)
}

function lastIndex(array) {
  return array.length - 1
}

function removePaths(arrayOfPaths, object) {
  const dissocPath = (initialObject, path) => R.dissocPath(path, initialObject)
  return R.reduce(dissocPath, object)(arrayOfPaths)
}

function addPaths(arrayOfPathValueTuples, object) {
  const assocPath = (initialObject, tuple) => R.assocPath(tuple[0], tuple[1], initialObject)
  return R.reduce(assocPath, object)(arrayOfPathValueTuples)
}

function interleave(firstArray, secondArray) {
  return R.flatten(firstArray.map((item, index) => [item, secondArray[index] || ''])).join('')
}

function getWhereKeyLike(string, object) {
  const stringIncludesKey = (value, key) => {
    const lowerCaseString = string.toLowerCase()
    return lowerCaseString.includes(key.toLowerCase())
  }

  return R.pipe(
    R.pickBy(stringIncludesKey),
    R.values
  )(object)[0]
}

function pickKey(predicate, object) {
  return R.pipe(
    R.pickBy(predicate),
    R.keys
  )(object)[0]
}

function firstKey(object) {
  return R.keys(object)[0]
}

function getFieldDetail(fieldPath, fieldConfig) {
  return R.pipe(
    R.values,
    R.head,
    R.path(fieldPath)
  )(fieldConfig)
}

function getFieldName(fieldConfig) {
  return R.pipe(
    R.keys,
    R.head
  )(fieldConfig)
}

function omit(keys, obj) {
  return R.omit(keys, obj)
}

/**
 * @template T
 * @type  {(result: Result<T>) => [T?, Error?]}
 */
function unwrapResult(result) {
  const error = /** @type { Error } */ (result)
  const success = /** @type { T } */ (result)
  const isError = Boolean(error && error.message)
  return [!isError ? success : undefined, isError ? error : undefined]
}
/**
 * @typedef {(error: Error) => string} ErrorMessageBuilder
 */

/**
 * @template T
 * @type  {(result: Result<T>, errorMessageBuilder: ErrorMessageBuilder) => T}
 */
function unwrapResultOrThrow(result, errorMessageBuilder) {
  const error = /** @type { Error } */ (result)
  const success = /** @type { T } */ (result)
  const isError = Boolean(error && error.message)
  if (isError) {
    throw new Error(errorMessageBuilder(error))
  }
  return success
}

function sortKeys(o) {
  return Object.keys(o || {})
    .sort()
    .reduce((r, k) => {
      const result = r
      result[k] = o[k]
      return result
    }, {})
}

module.exports = {
  getIn,
  isEmpty,
  flatten: R.flatten,
  notAllValuesEmpty,
  allValuesEmpty,
  replaceArrayItem,
  lastItem: R.last,
  merge: R.merge,
  mergeWithRight: R.mergeDeepRight,
  firstItem: R.head,
  lastIndex,
  removePath: R.dissocPath,
  removePaths,
  replacePath: R.assocPath,
  interleave,
  equals: R.equals,
  difference: R.difference,
  pipe: R.pipe,
  removeFromArray: R.remove,
  addToArray: R.append,
  all: R.all,
  getWhereKeyLike,
  pickKey,
  firstKey,
  getFieldDetail,
  getFieldName,
  pick: R.pick,
  pickBy: R.pickBy,
  addPaths,
  keys: R.keys,
  mapObject: R.mapObjIndexed,
  intersection: R.intersection,
  unwrapResult,
  unwrapResultOrThrow,
  omit,
  sortKeys,
}
