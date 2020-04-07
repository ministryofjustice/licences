/* eslint-disable no-param-reassign */
function flattenObject(source, target, prefix) {
  Object.keys(source).forEach((key) => {
    const sourceVal = source[key]
    const fullKey = `${prefix}_${key}`
    if (sourceVal && typeof sourceVal === 'object') {
      flattenObject(sourceVal, target, fullKey)
    } else {
      target[fullKey] = sourceVal
    }
  })
}

exports.flattenMeta = function flattenMeta(...meta) {
  const flat = {}
  meta.forEach((item, i) => {
    if (typeof item === 'object') {
      Object.entries(item || {}).forEach(([prop, val]) => {
        const key = meta.length === 1 ? prop : `${i}_${prop}`
        if (val && typeof val === 'object') {
          flattenObject(val, flat, key)
        } else {
          flat[key] = val
        }
      })
    } else {
      flat[i] = item
    }
  })
  return flat
}
