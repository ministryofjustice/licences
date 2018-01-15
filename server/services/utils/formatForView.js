const moment = require('moment');
const setCase = require('case');
module.exports = {formatObjectForView};

function formatObjectForView(object, options) {
    return Object.keys(object).reduce((builtObject, itemKey) => {

        if (object[itemKey] instanceof Object && !Array.isArray(object[itemKey])) {
            return {...builtObject, [itemKey]: formatObjectForView(object[itemKey], options)};
        }

        if (options.dates && options.dates.includes(itemKey)) {
            return {...builtObject, [itemKey]: moment(object[itemKey]).format('DD/MM/YYYY')};
        }

        if (options.capitalise && options.capitalise.includes(itemKey)) {
            return {...builtObject, [itemKey]: setCase.capital(object[itemKey].toLowerCase())};
        }

        return {...builtObject, [itemKey]: object[itemKey]};
    }, {});
}
