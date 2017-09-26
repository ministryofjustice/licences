const logger = require('../../log');

const audit = require('../data/audit');
const {getLicences} = require('../data/licences');
const {getOffenders} = require('../data/delius');
const {getReleases} = require('../data/nomis');

exports.getIndex = function(req, res) {

    audit.record('VIEW_DASHBOARD', 'anonymous', {todo: 'data'});

    // Get the ID of the current logged in offender manager user
    const user = '1';

    // Ask Delius database for the list of offenders related to this offender manager
    return getOffenders(user)
        .then(offenders => {
            return getUpcomingReleasesData(res, offenders.nomisIds);
        }).catch(error => {
            logger.error('Error during get delius offender list request: ', error.message);
            renderErrorPage(res, error);
        });
};

function getUpcomingReleasesData(res, nomisIds) {

    // Ask the Nomis API for the upcoming releases for that list of offenders
    return getReleases(nomisIds)
        .then(upcoming => {
            if(upcoming && upcoming.length > 0) {
                const upcomingIds = upcoming.map(offender => offender.nomisId);
                return getActiveLicencesAndRender(res, upcoming, upcomingIds);
            }

            return res.render('dashboard/index');
        }).catch(error => {
            logger.error('Error during get delius offender list request: ', error.message);
            renderErrorPage(res, error);
        });
}

function getActiveLicencesAndRender(res, upcoming, upcomingIds) {

    // Find licence records for that list of releases
    return getLicences(upcomingIds)
        .then(activeLicences => {
            return res.render('dashboard/index', parseDashboardInfo(upcoming, activeLicences));
        }).catch(error => {
            logger.error('Error during get active licences request: ', error.message);
            renderErrorPage(res, error);
        });
}

function parseDashboardInfo(upcoming, activeLicences) {

    const required = upcoming.map(offender => {
        const licence = activeLicences.find(licence => licence.nomisId === offender.nomisId);
        return licence ? Object.assign(offender, {inProgress: true, licenceId: licence.id}) : offender;
    });

    return {
        required,
        // to do add 'sent' licences
        moment: require('moment')
    };
}


function renderErrorPage(res, err) {
    logger.error('Error getting dashboard info ', {error: err});
    res.render('dashboard/index', {
        err: {
            title: 'Unable to talk to the database',
            desc: 'Please try again'
        }
    });
}
