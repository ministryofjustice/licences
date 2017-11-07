const logger = require('../../log.js');
const licenceStates = require('../data/licenceStates.js');

module.exports = function createTasklistService(deliusClient, nomisClientBuilder, dbClient) {

    async function getDashboardDetail(user) {

        const nomisClient = nomisClientBuilder(user.token);
        const upcomingReleases = await getUserSpecificDataFor(user, deliusClient, nomisClient);

        try {
            const filteredUpcomingReleases = upcomingReleases.filter(release => {
                return release.releaseDate && true; // todo is this going to be needed or is it just bad test data?
            });

            if (isEmpty(filteredUpcomingReleases)) {
                logger.info('No upcoming releases');
                return {};
            }

            const licences = await dbClient.getLicences(getOffenderNomisIds(filteredUpcomingReleases));

            return parseTasklistInfo(filteredUpcomingReleases, licences);

        } catch (error) {
            logger.error('Error during getDashboardDetail: ', error.message);
            throw error;
        }
    }

    return {getDashboardDetail};
};

async function getUserSpecificDataFor(user, deliusClient, nomisClient) {
    const releasesRetrievalMethod = {
        OM: upcomingReleasesByOffender(deliusClient, nomisClient),
        OMU: upcomingReleasesByOffender(deliusClient, nomisClient),
        PM: upcomingReleasesByUser(nomisClient)
    };

    return await releasesRetrievalMethod[user.role](user);
}

const upcomingReleasesByOffender = async (deliusClient, nomisClient) => async user => {
    const token = user.token;
    const userId = user.staffId;

    try {
        const prisonerIds = await deliusClient.getPrisonersFor(userId, token);

        if (isEmpty(prisonerIds)) {
            logger.info('No prisoner IDs');
            return [];
        }

        return await nomisClient.getUpcomingReleasesByOffenders(prisonerIds);

    } catch (error) {
        logger.error('Error getting upcomingReleasesByOffender: ', error.message);
        throw error;
    }
};

const upcomingReleasesByUser = async nomisClient => async user => {

    try {
        const upcomingReleases = await nomisClient.getUpcomingReleasesByUser();
        logger.info('Got upcoming releases for user: ', user.staffId);
        logger.info(upcomingReleases);

    } catch (error) {
        logger.error('Error during getUpcomingReleasesByUser: ', error.message);
        throw error;
    }
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

