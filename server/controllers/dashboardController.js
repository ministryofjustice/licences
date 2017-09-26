const logger = require('../../log');

const audit = require('../data/audit');
const {getLicences} = require('../data/licences');

exports.getIndex = function(req, res) {

    logger.debug('GET /dashboard');
    audit.record('VIEW_DASHBOARD', 'anonymous', {todo: 'data'});


    // Get the ID of the current loged in offender manager user
    // const user = 'someone';

    // Ask Delius database for the list of offenders related to this offender manager
    // const nomisIds = ['A1235HG', 'A6627JH', 'three', 'four'];

    // Ask the Nomis API for the upcoming releases for that list of offenders
    const upcoming =
        [
            {
                name: 'Andrews, Mark',
                nomisId: 'A1235HG',
                establishment: 'HMP Manchester',
                dischargeDate: '2017-11-01'
            },
            {
                name: 'Bryanston, David',
                nomisId: 'A6627JH',
                establishment: 'HMP Birmingham',
                dischargeDate: '2017-07-10'
            }
        ];

    // Find licence records for that list of releases
    const upcomingIds = upcoming.map(offender => offender.nomisId);

    return getLicences(upcomingIds)
        .then(activeLicences => {
            return res.render('dashboard/index', parseDashboardInfo(upcoming, activeLicences));
        }).catch(error => {
            logger.error('Error during get dashboard info request: ', error.message);
            renderErrorPage(res, error);
        });
};

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
