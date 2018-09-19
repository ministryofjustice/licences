module.exports = {
    getPathFor
};

function getPathFor({data, config, action}) {

    const {nextPath} = config;

    if (!nextPath.decisions) {
        return nextPath.path;
    }

    if (Array.isArray(nextPath.decisions)) {
        const path = determinePathFromDecisions({decisions: nextPath.decisions, data, action});

        if (path) {
            return path[action] || path['path'] || path;
        }

        return nextPath[action] || nextPath.path;
    }

    return getPathFromAnswer({nextPath: nextPath.decisions, data, action}) || nextPath.path;
}

function getPathFromAnswer({nextPath, data, action}) {
    const decidingValue = data[nextPath.discriminator];
    return nextPath[decidingValue] ? nextPath[decidingValue][action] || nextPath[decidingValue] : null;
}

function determinePathFromDecisions({decisions, data, action}) {
    let path = null;
    for (let pathConfig of decisions) {
        const newPath = getPathFromAnswer({nextPath: pathConfig, data, action});

        if (newPath) {
            path = newPath;
            break;
        }
    }

    return path;
}
