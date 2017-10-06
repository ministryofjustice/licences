module.exports = function createLicenceDetailsService(api, db) {
    async function getDashboardDetail(userId) {
        try {
            const upcomingReleases = await api.getUpcomingReleases(userId);

            if (isEmpty(upcomingReleases)) {
                return {};
            }

            const activeLicences = await db.getLicences(getOffenderNomisIds(upcomingReleases));

            return parseDashboardInfo(upcomingReleases, activeLicences);

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

function parseDashboardInfo(upcomingReleases, activeLicences) {

    return upcomingReleases.map(offender => {
        const licence = activeLicences.find(licence => licence.nomisId === offender.nomisId);

        if(licence) {
            const licenceLocator = {inProgress: true, licenceId: licence.id};
            return {...offender, ...licenceLocator};
        }

        return offender;
    });
}

