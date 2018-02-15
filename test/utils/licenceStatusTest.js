const {getLicenceStatus} = require('../../server/utils/licenceStatus');
const {expect} = require('../testSetup');
const {taskStates} = require('../../server/models/taskStates');

describe('getTaskData', () => {

    it('should show licence stage', () => {
        const licence = {
            status: 'some-processing-stage'
        };

        const status = getLicenceStatus(licence);

        expect(status.stage).to.eql('some-processing-stage');
    });


    it('should show no decisions when empty licence', () => {
        const licence = {};

        const status = getLicenceStatus(licence);

        expect(status.decisions).to.eql({});
    });

    it('should show no tasks when empty licence', () => {
        const licence = {};

        const status = getLicenceStatus(licence);

        expect(status.tasks).to.eql({});
    });

    it('should show true decisions when decision data is present for truth', () => {
        const licence = {
            status: 'some-processing-stage',
            licence: {
                eligibility: {
                    excluded: {
                        decision: 'Yes'
                    },
                    suitability: {
                        decision: 'Yes'
                    },
                    crdTime: {
                        decision: 'Yes'
                    }
                },
                proposedAddress: {
                    optOut: {
                        decision: 'Yes'
                    },
                    bassReferral: {
                        decision: 'Yes'
                    }
                },
                curfew: {
                    curfewAddressReview: {
                        consent: 'Yes',
                        electricity: 'Yes',
                        homeVisitConducted: 'Yes',
                        deemedSafe: 'Yes'
                    }
                },
                risk: {
                    riskManagement: {
                        planningActions: 'Yes',
                        victimLiaison: 'Yes'
                    }
                },
                approval: 'Yes',
                addressRejected: 'Yes',
                postponed: 'Yes'
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.decisions.excluded).to.eql(true);
        expect(status.decisions.insufficientTime).to.eql(true);
        expect(status.decisions.unsuitable).to.eql(true);
        expect(status.decisions.optedOut).to.eql(true);
        expect(status.decisions.bassReferralNeeded).to.eql(true);
        expect(status.decisions.curfewAddressApproved).to.eql(true);
        expect(status.decisions.riskManagementNeeded).to.eql(true);
        expect(status.decisions.victimLiasionNeeded).to.eql(true);
        expect(status.decisions.approved).to.eql(true);
        expect(status.decisions.refused).to.eql(false);
        expect(status.decisions.postponed).to.eql(true);
    });

    it('should show licence conditions data', () => {

        const licence = {
            status: 'some-processing-stage',
            licence: {
                licenceConditions: {
                    standardConditions: {
                        additionalConditionsRequired: 'Yes'
                    },
                    additional: {
                        1: {},
                        2: {}
                    },
                    bespoke: [
                        1, 2, 3, 4
                    ]
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.decisions.standardOnly).to.eql(false);
        expect(status.decisions.additional).to.eql(2);
        expect(status.decisions.bespoke).to.eql(4);
    });


    it('should show false decisions when decision data is present for false', () => {
        const licence = {
            status: 'some-processing-stage',
            licence: {
                eligibility: {
                    excluded: {
                        decision: 'No'
                    },
                    suitability: {
                        decision: 'No'
                    },
                    crdTime: {
                        decision: 'No'
                    }
                },
                proposedAddress: {
                    optOut: {
                        decision: 'No'
                    },
                    bassReferral: {
                        decision: 'No'
                    }
                },
                approval: 'No',
                addressRejected: 'No',
                postponed: 'No'
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.decisions.excluded).to.eql(false);
        expect(status.decisions.insufficientTime).to.eql(false);
        expect(status.decisions.unsuitable).to.eql(false);
        expect(status.decisions.optedOut).to.eql(false);
        expect(status.decisions.bassReferralNeeded).to.eql(false);
        expect(status.decisions.curfewAddressApproved).to.eql(false);
        expect(status.decisions.riskManagementNeeded).to.eql(false);
        expect(status.decisions.victimLiasionNeeded).to.eql(false);
        expect(status.decisions.approved).to.eql(false);
        expect(status.decisions.refused).to.eql(true);
        expect(status.decisions.postponed).to.eql(false);
    });

    it('should show eligible when eligibility decisions false', () => {
        const licence = {
            status: 'some-processing-stage',
            licence: {
                eligibility: {
                    excluded: {
                        decision: 'No'
                    },
                    suitability: {
                        decision: 'No'
                    },
                    crdTime: {
                        decision: 'No'
                    }
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.decisions.eligible).to.eql(true);
    });

    it('should show NOT eligible when eligibility decision true', () => {
        const licence = {
            status: 'some-processing-stage',
            licence: {
                eligibility: {
                    excluded: {
                        decision: 'No'
                    },
                    suitability: {
                        decision: 'Yes'
                    },
                    crdTime: {
                        decision: 'No'
                    }
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.decisions.eligible).to.eql(false);
    });


    it('should show tasks UNSTARTED when task data missing', () => {
        const licence = {
            licence: {}
        };

        const status = getLicenceStatus(licence);

        expect(status.tasks.exclusion).to.eql(taskStates.UNSTARTED);
        expect(status.tasks.crdTime).to.eql(taskStates.UNSTARTED);
        expect(status.tasks.suitability).to.eql(taskStates.UNSTARTED);
        expect(status.tasks.eligibility).to.eql(taskStates.UNSTARTED);
        expect(status.tasks.optOut).to.eql(taskStates.UNSTARTED);
        expect(status.tasks.bassReferral).to.eql(taskStates.UNSTARTED);
        expect(status.tasks.curfewAddress).to.eql(taskStates.UNSTARTED);
        expect(status.tasks.curfewAddressReview).to.eql(taskStates.UNSTARTED);
        expect(status.tasks.curfewHours).to.eql(taskStates.UNSTARTED);
        expect(status.tasks.licenceConditions).to.eql(taskStates.UNSTARTED);
        expect(status.tasks.riskManagement).to.eql(taskStates.UNSTARTED);
        expect(status.tasks.reportingInstructions).to.eql(taskStates.UNSTARTED);
        expect(status.tasks.approval).to.eql(taskStates.UNSTARTED);
    });

    it('should show tasks STARTED when task data incomplete for tasks that can be STARTED', () => {
        const licence = {
            status: 'some-processing-stage',
            licence: {
                proposedAddress: {
                    curfewAddress: {
                        something: {}
                    }
                },
                licenceConditions: {
                    standardConditions: {
                        additionalConditionsRequired: 'Yes'
                    }
                },
                curfew: {
                    curfewAddressReview: {
                        consent: {}
                    }
                },
                risk: {
                    riskManagement: {
                        planningActions: {}
                    }
                },
                reporting: {
                    reportingInstructions: {}
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.tasks.curfewAddress).to.eql(taskStates.STARTED);
        expect(status.tasks.curfewAddressReview).to.eql(taskStates.STARTED);
        expect(status.tasks.licenceConditions).to.eql(taskStates.STARTED);
        expect(status.tasks.riskManagement).to.eql(taskStates.STARTED);
    });

    it('should show tasks DONE when task data complete', () => {
        const licence = {
            status: 'some-processing-stage',
            licence: {
                eligibility: {
                    excluded: {
                        decision: 'Yes',
                        reason: 'blah'
                    },
                    suitability: {
                        decision: 'Yes',
                        reason: 'blah'
                    },
                    crdTime: {
                        decision: 'No'
                    }
                },
                proposedAddress: {
                    optOut: {
                        decision: 'Yes',
                        reason: 'blah'
                    },
                    bassReferral: {
                        decision: 'Yes',
                        town: 'blah',
                        county: 'blah'
                    }
                },
                curfew: {
                    curfewAddressReview: {
                        consent: 'Yes',
                        electricity: 'Yes',
                        homeVisitConducted: 'Yes',
                        deemedSafe: 'Yes'
                    },
                    curfewHours: 'anything'
                },
                licenceConditions: {
                    standardConditions: {
                        additionalConditionsRequired: 'No'
                    }
                },
                risk: {
                    riskManagement: {
                        planningActions: 'anything',
                        victimLiaison: 'anything'
                    }
                },
                reporting: {
                    reportingInstructions: 'anything'
                },
                approval: 'Yes'
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.tasks.exclusion).to.eql(taskStates.DONE);
        expect(status.tasks.crdTime).to.eql(taskStates.DONE);
        expect(status.tasks.suitability).to.eql(taskStates.DONE);
        expect(status.tasks.eligibility).to.eql(taskStates.DONE);
        expect(status.tasks.optOut).to.eql(taskStates.DONE);
        expect(status.tasks.bassReferral).to.eql(taskStates.DONE);
        expect(status.tasks.curfewAddress).to.eql(taskStates.UNSTARTED); // todo
        expect(status.tasks.curfewAddressReview).to.eql(taskStates.DONE);
        expect(status.tasks.curfewHours).to.eql(taskStates.DONE);
        expect(status.tasks.licenceConditions).to.eql(taskStates.DONE);
        expect(status.tasks.riskManagement).to.eql(taskStates.DONE);
        expect(status.tasks.reportingInstructions).to.eql(taskStates.DONE);
        expect(status.tasks.approval).to.eql(taskStates.DONE);
    });
});
