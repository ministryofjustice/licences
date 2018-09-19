const {getIn, isEmpty, firstItem} = require('../../utils/functionalHelpers');
const {getLicenceStatus} = require('../../utils/licenceStatus');
const {getPathFor} = require('../../utils/routes');

module.exports = ({formConfig, licenceService, sectionName}) => {

    function get(req, res) {
        const {formName, bookingId} = req.params;
        return formGet(req, res, sectionName, formName, bookingId);
    }

    function formGet(req, res, sectionName, formName, bookingId) {
        const {licenceSection, nextPath, pageDataMap, validateInPlace} = formConfig[formName];
        const dataPath = pageDataMap || ['licence', sectionName, licenceSection];
        const data = getIn(res.locals.licence, dataPath) || {};
        const licenceStatus = getLicenceStatus(res.locals.licence);

        const errors = validateInPlace && firstItem(req.flash('errors'));
        const errorObject = getIn(errors, [sectionName, formName]) || {};
        const viewData = {bookingId, data, nextPath, licenceStatus, errorObject};

        res.render(`${sectionName}/${formName}`, viewData);
    }

    async function post(req, res) {
        const {formName, bookingId} = req.params;
        return formPost(req, res, sectionName, formName, bookingId);
    }

    async function pathPost(req, res) {
        const {formName, bookingId, path} = req.params;
        return formPost(req, res, sectionName, formName, bookingId, path + '/');
    }

    async function formPost(req, res, sectionName, formName, bookingId, path = '') {
        const nextPath = getPathFor({data: req.body, config: formConfig[formName]});
        const saveSection = formConfig[formName].saveSection || [];

        if (formConfig[formName].fields) {
            const updatedLicence = await licenceService.update({
                bookingId: bookingId,
                config: formConfig[formName],
                userInput: req.body,
                licenceSection: saveSection[0] || sectionName,
                formName: saveSection[1] || formName
            });

            if (formConfig[formName].validateInPlace) {
                const errors = licenceService.getValidationErrorsForPage(updatedLicence, sectionName);

                if (!isEmpty(getIn(errors, [sectionName, formName]))) {
                    req.flash('errors', errors);
                    return res.redirect(`/hdc/${sectionName}/${formName}/${path}${bookingId}`);
                }
            }
        }

        if (req.body.anchor) {
            return res.redirect(`${nextPath}${path}${bookingId}#${req.body.anchor}`);
        }

        res.redirect(`${nextPath}${path}${bookingId}`);
    }

    return {
        get,
        post,
        pathPost
    };
};
