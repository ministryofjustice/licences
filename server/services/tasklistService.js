const logger = require('../../log.js');

module.exports = function createTasklistService(deliusClient, nomisClientBuilder, dbClient) {

    async function getDashboardDetail(userId, token) {

        const nomisClient = nomisClientBuilder(token);

        try {
            const prisonerIds = await deliusClient.getPrisonersFor(userId);
            logger.info(`Got Delius prisoner ids for ${userId}: ${prisonerIds}`);

            if (isEmpty(prisonerIds)) {
                logger.info('No prisoner IDs');
                return {};
            }

            const upcomingReleases = await nomisClient.getUpcomingReleasesFor(prisonerIds);
            logger.info(`Got upcoming releases: ${upcomingReleases}`);

            if (isEmpty(upcomingReleases)) {
                logger.info('No upcoming releases');
                return {};
            }

            const activeLicences = await dbClient.getLicences(getOffenderNomisIds(upcomingReleases));
            logger.info(`Got active licences: ${activeLicences}`);

            return parseTasklistInfo(upcomingReleases, activeLicences);

        } catch (error) {

            // TODO more specific api failure handling
            console.error('Error during getDashboardDetail: ', error.message);
            throw error;
        }
    }

    return {getDashboardDetail};
};

function isEmpty(candidateArray) {
    return !candidateArray || candidateArray.length <= 0;
}

function getOffenderNomisIds(releases) {
    return releases.map(offender => offender.nomisId);
}

function parseTasklistInfo(upcomingReleases, activeLicences) {

    return upcomingReleases.map(offender => {
        const licence = activeLicences.find(licence => licence.nomisId === offender.nomisId);

        if(licence) {
            const licenceLocator = {inProgress: true, licenceId: licence.id};
            return {...offender, ...licenceLocator};
        }

        return offender;
    });
}

