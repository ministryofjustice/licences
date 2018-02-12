module.exports = {
    getPathFor
};

function getPathFor({data, config}) {
    return decidePath({nextPath: config.nextPath, data});
}

function decidePath({nextPath, data}) {
    if (!nextPath.decisions) {
        return nextPath.path;
    }

    if (Array.isArray(nextPath.decisions)) {
        const path = determinePathFromDecisions({decisions: nextPath.decisions, data});

        return path || nextPath.path;
    }


    return getPathFromAnswer({nextPath: nextPath.decisions, data}) || nextPath.path;
}

function getPathFromAnswer({nextPath, data}) {
    const decidingValue = data[nextPath.discriminator];
    return nextPath[decidingValue];
}

function determinePathFromDecisions({decisions, data}) {
    let path = null;
    for (let pathConfig of decisions) {
        const newPath = getPathFromAnswer({nextPath: pathConfig, data});

        if (newPath) {
            path = newPath;
            break;
        }
    }

    return path;
}


