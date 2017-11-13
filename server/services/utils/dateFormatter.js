const moment = require('moment');
module.exports = {formatDates};

function formatDates(object, dates) {
    return Object.keys(object).reduce((builtObject, itemKey) => {
        if (dates.includes(itemKey)) {
            return {...builtObject, [itemKey]: moment(object[itemKey]).format('DD/MM/YYYY')};
        }
        return {...builtObject, [itemKey]: object[itemKey]};
    }, {});
}
