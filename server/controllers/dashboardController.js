const logger = require('../../log');
const audit = require('../data/audit');

const {getOffenders} = require('../data/delius');
const {getUpcomingReleases} = require('../data/nomis');
const {getLicences} = require('../data/licences');

exports.getIndex = function(req, res) {

    const user = getLoggedInUserId();

    audit.record('VIEW_DASHBOARD', user, {todo: 'data'});

    return getDashboardDetail(res, user);
};

function getLoggedInUserId() {
    // todo
    return '1';
}

async function getDashboardDetail(res, user) {

    try {
        const offenders = await getOffenders(user);

        if (isEmpty(offenders)) {
            return res.render('dashboard/index');
        }

        const upcomingReleases = await getUpcomingReleases(offenders.nomisIds);

        if (isEmpty(upcomingReleases)) {
            return res.render('dashboard/index');
        }

        const activeLicences = await getLicences(getOffenderNomisIds(upcomingReleases));
        const dashboardInfo = parseDashboardInfo(upcomingReleases, activeLicences);

        return res.render('dashboard/index', dashboardInfo);


    } catch (error) {
        logger.error('Error during getDashboardDetail: ', error.message);
        return renderErrorPage(res, error);
    }
}

function isEmpty(candidateArray) {
    return !candidateArray || candidateArray.length <= 0;
}

function getOffenderNomisIds(releases) {
    return releases.map(offender => offender.nomisId);
}

function parseDashboardInfo(upcomingReleases, activeLicences) {

    const required = upcomingReleases.map(offender => {
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
