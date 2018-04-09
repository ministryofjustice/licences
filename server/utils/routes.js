module.exports = {
    getPathFor
};

function getPathFor({data, config}) {
    const {nextPath} = config;
    const appendText = nextPath.pathAppend ? `${data[nextPath.pathAppend]}/` : '';
    const defaultPath = `${nextPath.path}${appendText}`;

    if (!nextPath.decisions) {
        return defaultPath;
    }

    if (Array.isArray(nextPath.decisions)) {
        const path = determinePathFromDecisions({decisions: nextPath.decisions, data});

        return path || defaultPath;
    }

    return getPathFromAnswer({nextPath: nextPath.decisions, data}) || defaultPath;
}

function getPathFromAnswer({nextPath, data}) {
    const decidingValue = data[nextPath.discriminator];
    const path = nextPath[decidingValue];
    return data[nextPath.pathAppend] ? `${path}${data[nextPath.pathAppend]}/` : path;
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


