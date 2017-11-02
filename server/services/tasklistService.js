const logger = require('../../log.js');
const licenceStates = require('../data/licenceStates.js');

module.exports = function createTasklistService(deliusClient, nomisClientBuilder, dbClient) {

    async function getDashboardDetail(userId, token) {

        const nomisClient = nomisClientBuilder(token);

        try {
            const prisonerIds = await deliusClient.getPrisonersFor(userId);
            logger.info(`Got Delius prisoner ids for [${userId}]: [${prisonerIds}]`);

            if (isEmpty(prisonerIds)) {
                logger.info('No prisoner IDs');
                return {};
            }

            const upcomingReleases = await nomisClient.getUpcomingReleasesFor(prisonerIds);
            logger.info('Got upcoming releases:');
            logger.info(upcomingReleases);

            const filteredUpcomingReleases = upcomingReleases.filter(release => {
               return release.releaseDate && true; // && todo filter by date;
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

    return {getDashboardDetail};
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


        if(licence) {
            const licenceLocator = {status: licence.status, licenceId: licence.id};
            return {...offender, ...licenceLocator};
        }

        return {...offender, ...{status: 'UNSTARTED'}};
    });

    const required = allReleases.filter(release => licenceStates.REQUIRED_STATES.includes(release.status));
    const sent = allReleases.filter(release => licenceStates.SENT_STATES.includes(release.status));

    return {required, sent};
}

