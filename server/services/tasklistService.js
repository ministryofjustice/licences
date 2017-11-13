const logger = require('../../log.js');
const licenceStates = require('../data/licenceStates.js');
const {formatDates} = require('./utils/dateFormatter');

module.exports = function createTasklistService(deliusClient, nomisClientBuilder, dbClient) {

    async function getDashboardDetail(user) {

        try {
            const nomisClient = nomisClientBuilder(user.token);
            const upcomingReleases = await getUpcomingReleases(nomisClient, deliusClient, user);

            if (isEmpty(upcomingReleases)) {
                logger.info('No upcoming releases');
                return {};
            }

            const licences = await dbClient.getLicences(getOffenderIds(upcomingReleases));

            return parseTasklistInfo(upcomingReleases, licences);

        } catch (error) {
            logger.error('Error during getDashboardDetail: ', error.message);
            throw error;
        }
    }

    return {getDashboardDetail};
};

async function getUpcomingReleases(nomisClient, deliusClient, user) {

    const releasesRetrievalMethod = {
        OM: offendersByDeliusUser(nomisClient, deliusClient, user),
        OMU: offendersByCaseLoad(nomisClient),
        PM: offendersByCaseLoad(nomisClient)
    };

    return await releasesRetrievalMethod[user.roleCode]();
}

const offendersByDeliusUser = (nomisClient, deliusClient, user) => async () => {
    const offenderList = await deliusClient.getPrisonersFor(user.staffId);
    return await nomisClient.getUpcomingReleasesByOffenders(offenderList);
};

const offendersByCaseLoad = nomisClient => async () => {
    return nomisClient.getUpcomingReleasesByUser();
};

function isEmpty(candidateArray) {
    return !candidateArray || candidateArray.length <= 0;
}

function getOffenderIds(releases) {
    return releases.map(offender => offender.offenderNo);
}

function parseTasklistInfo(upcomingReleases, licences) {

    const allReleases = upcomingReleases.map(offender => {
        const licence = licences.find(licence => licence.nomisId === offender.offenderNo);
        const formattedOffender = formatDates(offender, ['releaseDate']);

        if (licence) {
            const licenceLocator = {status: licence.status, licenceId: licence.id};
            return {...formattedOffender, ...licenceLocator};
        }

        return {...formattedOffender, status: 'UNSTARTED'};
    });

    const required = allReleases.filter(release => licenceStates.REQUIRED_STATES.includes(release.status));
    const sent = allReleases.filter(release => licenceStates.SENT_STATES.includes(release.status));
    const checking = allReleases.filter(release => licenceStates.CHECKING_STATES.includes(release.status));
    const checkSent = allReleases.filter(release => licenceStates.CHECK_SENT_STATES.includes(release.status));
    const approved = allReleases.filter(release => licenceStates.APPROVED_STATES.includes(release.status));

    return {
        required,
        sent,
        checking,
        checkSent,
        approved
    };
}
