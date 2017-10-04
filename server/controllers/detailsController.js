const logger = require('../../log');
const audit = require('../data/audit');

const {getPrisonerInfo} = require('../data/api');

exports.getIndex = function(req, res) {

    const user = getLoggedInUserId();
    const nomisId = req.params.nomisId;

    audit.record('VIEW_PRISONER_DETAILS', user, {nomisId});

    return getDetailsInfo(res, nomisId);
};

function getLoggedInUserId() {
    // todo
    return '1';
}

async function getDetailsInfo(res, nomisId) {

    try {
        const prisonerInfo = await getPrisonerInfo(nomisId);

        if(!prisonerInfo.nomsId) {
            logger.error('Error during getDetailsInfo: empty response');
            return renderErrorPage(res, {});
        }

        const pageData= {
            prisonerInfo,
            moment: require('moment')
        };

        return res.render('details/index', pageData);

    } catch (error) {
        logger.error('Error during getDetailsInfo: ', error.message);
        return renderErrorPage(res, error);
    }
}

function renderErrorPage(res, err) {
    logger.error('Error getting prisoner details ', {error: err});
    res.status(500);
    res.render('details/index', {
        err: {
            title: 'Unable to talk to the database',
            desc: 'Please try again'
        }
    });
}

exports.createLicence = function(req, res) {
    return res.redirect('/dischargeAddress/AB111111');
};
