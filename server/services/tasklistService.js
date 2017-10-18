module.exports = function createTasklistService(deliusClient, nomisClientBuilder, dbClient) {

    async function getDashboardDetail(userId, token) {

        const nomisClient = nomisClientBuilder(token);

        try {
            const prisonerIds = await deliusClient.getPrisonersFor(userId);

            const upcomingReleases = await nomisClient.getUpcomingReleasesFor(prisonerIds);

            if (isEmpty(upcomingReleases)) {
                return {};
            }

            const activeLicences = await dbClient.getLicences(getOffenderNomisIds(upcomingReleases));

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

