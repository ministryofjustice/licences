const {getIn, isEmpty, firstItem} = require('../../utils/functionalHelpers');
const {getPathFor} = require('../../utils/routes');

module.exports = ({formConfig, licenceService, sectionName}) => {

    function get(req, res) {
        const {formName, bookingId, action} = req.params;
        return formGet(req, res, sectionName, formName, bookingId, action);
    }

    function formGet(req, res, sectionName, formName, bookingId, action) {
        const {licenceSection, nextPath, pageDataMap, validateInPlace} = formConfig[formName];
        const dataPath = pageDataMap || ['licence', sectionName, licenceSection];

        const rawData = getIn(res.locals.licence, dataPath) || {};
        const data = licenceService.addSplitDateFields(rawData, formConfig[formName].fields);
        const errors = validateInPlace && firstItem(req.flash('errors'));
        const errorObject = getIn(errors, [sectionName, formName]) || {};
        const viewData = {bookingId, data, nextPath, errorObject, action, sectionName, formName};

        res.render(`${sectionName}/${formName}`, viewData);
    }

    async function post(req, res) {
        const {formName, bookingId, action} = req.params;
        return formPost(req, res, sectionName, formName, bookingId, action);
    }


    async function formPost(req, res, sectionName, formName, bookingId, action) {
        const nextPath = getPathFor({data: req.body, config: formConfig[formName], action});
        const saveSection = formConfig[formName].saveSection || [];

        const targetSection = saveSection[0] || sectionName;
        const targetForm = saveSection[1] || formName;

        if (formConfig[formName].fields) {
            const updatedLicence = await licenceService.update({
                bookingId: bookingId,
                config: formConfig[formName],
                userInput: req.body,
                licenceSection: targetSection,
                formName: targetForm
            });

            if (formConfig[formName].validateInPlace) {
                const errors = licenceService.getValidationErrorsForPage(updatedLicence, [targetForm]);

                if (!isEmpty(getIn(errors, [targetSection, targetForm]))) {
                    req.flash('errors', errors);
                    const actionPath = action ? action + '/' : '';
                    return res.redirect(`/hdc/${sectionName}/${formName}/${actionPath}${bookingId}`);
                }
            }
        }

        if (req.body.anchor) {
            return res.redirect(`${nextPath}${bookingId}#${req.body.anchor}`);
        }

        if (req.body.path) {
            return res.redirect(`${nextPath}${req.body.path}/${bookingId}`);
        }

        res.redirect(`${nextPath}${bookingId}`);
    }

    return {
        get,
        post
    };
};
