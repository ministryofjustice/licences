
exports.resolveJsonResponse = resolve => response => {
    if(response === 0) {
        return resolve([]);
    }

    const concatenatedResponse = response.map(valueOfJsonSegment).join('');
    resolve(JSON.parse(concatenatedResponse));
};

exports.resolveJsonColumn = (resolve, column) => response => {
    if(response === 0) {
        return resolve([]);
    }
    const output = response.map(row => {
       return {...row, [column]: {value: JSON.parse(row[column].value)}};
    });

    resolve(output);
};

const valueOfJsonSegment = responseSegment => {
    return Object.keys(responseSegment).reduce((segmentString, segmentKey) => {
        if (segmentKey.includes('JSON')) {
            return segmentString.concat(responseSegment[segmentKey].value);
        }
        return segmentString;
    }, '');
};
