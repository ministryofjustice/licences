/* eslint-disable no-param-reassign */
function flattenObject(source, target, prefix) {
    Object.keys(source).forEach(key => {
        const sourceVal = source[key]
        const fullKey = `${prefix}_${key}`
        if (sourceVal && typeof sourceVal === 'object') {
            flattenObject(sourceVal, target, fullKey)
        } else {
            target[fullKey] = sourceVal
        }
    })
}

exports.flattenMeta = function flattenMeta(meta) {
    const flat = {}
    Object.keys(meta).forEach(key => {
        const val = meta[key]
        if (val && typeof val === 'object') {
            flattenObject(val, flat, key)
        } else {
            flat[key] = val
        }
    })
    return flat
}
