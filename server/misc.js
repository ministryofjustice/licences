function flattenObject(source, target, prefix) {
    Object.keys(source).forEach(function(key) {
        let sourceVal = source[key];
        let fullKey = prefix + '_' + key;
        if (sourceVal && typeof sourceVal === 'object') {
            flattenObject(sourceVal, target, fullKey);
        } else {
            target[fullKey] = sourceVal;
        }
    });
}

exports.flattenMeta = function flattenMeta(meta) {
    let flat = {};
    Object.keys(meta).forEach(function(key) {
        let val = meta[key];
        if (val && typeof val === 'object') {
            flattenObject(val, flat, key);
        } else {
            flat[key] = val;
        }
    });
    return flat;
};
