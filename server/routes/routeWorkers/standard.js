const {getIn, isEmpty, firstItem, lastItem} = require('../../utils/functionalHelpers');
const {getPathFor} = require('../../utils/routes');

module.exports = ({formConfig, licenceService, sectionName}) => {

    function get(req, res) {
        const {formName, bookingId, action} = req.params;
        return formGet(req, res, sectionName, formName, bookingId, action);
    }

    function formGet(req, res, sectionName, formName, bookingId, action) {
        const {licenceSection, nextPath, pageDataMap} = formConfig[formName];
        const dataPath = pageDataMap || ['licence', sectionName, licenceSection];

        const rawData = getIn(res.locals.licence, dataPath) || {};
        const data = licenceService.addSplitDateFields(rawData, formConfig[formName].fields);
        const errorObject = firstItem(req.flash('errors')) || {};

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

        const postApproval = res.locals.licence ? ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'].includes(res.locals.licence.stage) : false;
        const validationErrors = updatedLicence => {
            const form = updatedLicence[sectionName][formName];
            // address is in array
            const formToValidate = form.addresses ? lastItem(form.addresses) : form;
            return licenceService.validateForm({
                formResponse: formToValidate,
                pageConfig: formConfig[formName],
                formType: formName,
                bespokeConditions: {postApproval, confiscationOrder: res.locals.licenceStatus.decisions.confiscationOrder}
            });
        };

        const updatedLicence = await licenceService.update({
            bookingId,
            originalLicence: res.locals.licence,
            config: formConfig[formName],
            userInput: req.body,
            licenceSection: targetSection,
            formName: targetForm
        });

        if (formConfig[formName].validate) {
            const errors = validationErrors(updatedLicence);

            if (!isEmpty(errors)) {
                req.flash('errors', errors);
                const actionPath = action ? action + '/' : '';
                return res.redirect(`/hdc/${sectionName}/${formName}/${actionPath}${bookingId}`);
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
