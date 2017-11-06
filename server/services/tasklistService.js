const logger = require('../../log.js');
const licenceStates = require('../data/licenceStates.js');

module.exports = function createTasklistService(deliusClient, nomisClientBuilder, dbClient) {

    async function getUpcomingReleasesByDeliusOffenderList(userId, token) {

        const nomisClient = nomisClientBuilder(token);

        try {
            const prisonerIds = await deliusClient.getPrisonersFor(userId);
            logger.info(`Got Delius prisoner ids for [${userId}]: [${prisonerIds}]`);

            if (isEmpty(prisonerIds)) {
                logger.info('No prisoner IDs');
                return [];
            }

            const upcomingReleases = await nomisClient.getUpcomingReleasesByOffenders(prisonerIds);
            logger.info('Got upcoming releases for offender list:');
            logger.info(upcomingReleases);

            return upcomingReleases;
        } catch (error) {
            logger.error('Error during getUpcomingReleasesByDeliusOffenderList: ', error.message);
            throw error;
        }
    }

    async function getUpcomingReleasesByUser(userId, token) {

        const nomisClient = nomisClientBuilder(token);

        try {
            const upcomingReleases = await nomisClient.getUpcomingReleasesByUser();
            logger.info('Got upcoming releases for user:');
            logger.info(upcomingReleases);

            return upcomingReleases;
        } catch (error) {
            logger.error('Error during getUpcomingReleasesByUser: ', error.message);
            throw error;
        }
    }

    async function getDashboardDetail(upcomingReleases) {

        try {
            const filteredUpcomingReleases = upcomingReleases.filter(release => {
                return release.releaseDate && true; // todo is this going to be needed or is it just bad test data?
            });

            if (isEmpty(filteredUpcomingReleases)) {
                logger.info('No upcoming releases');
                return {};
            }

            const licences = await dbClient.getLicences(getOffenderNomisIds(filteredUpcomingReleases));
            logger.info('Got active licences:');
            logger.info(licences);

            return parseTasklistInfo(filteredUpcomingReleases, licences);

        } catch (error) {
            logger.error('Error during getDashboardDetail: ', error.message);
            throw error;
        }
    }

    return {
        getUpcomingReleasesByDeliusOffenderList,
        getUpcomingReleasesByUser,
        getDashboardDetail
    };
};

function isEmpty(candidateArray) {
    return !candidateArray || candidateArray.length <= 0;
}

function getOffenderNomisIds(releases) {
    return releases.map(offender => offender.offenderNo);
}

function parseTasklistInfo(upcomingReleases, licences) {

    const allReleases = upcomingReleases.map(offender => {
        const licence = licences.find(licence => licence.nomisId === offender.offenderNo);


        if (licence) {
            const licenceLocator = {status: licence.status, licenceId: licence.id};
            return {...offender, ...licenceLocator};
        }

        return {...offender, ...{status: 'UNSTARTED'}};
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

