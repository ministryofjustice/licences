module.exports = {
    getPathFor
};


function decidePath({decisionInfo, data}) {
    const decidingValue = data[decisionInfo.discriminator];
    return decisionInfo[decidingValue];
}

function getPathFor({formName, data, formConfig}) {
    if (formConfig[formName].nextPath) {
        return formConfig[formName].nextPath;
    }
    if (formConfig[formName].nextPathDecision) {
        return decidePath({decisionInfo: formConfig[formName].nextPathDecision, data});
    }
    return null;
}
