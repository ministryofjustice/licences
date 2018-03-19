const {getLicenceStatus} = require('../../server/utils/licenceStatus');
const {expect} = require('../testSetup');
const {taskStates} = require('../../server/models/taskStates');

describe('getLicenceStatus', () => {

    it('should show licence stage', () => {
        const licence = {
            status: 'ELIGIBILITY',
            licence: 'anything'
        };

        const status = getLicenceStatus(licence);

        expect(status.stage).to.eql('ELIGIBILITY');
    });


    it('should show no decisions when empty licence', () => {
        const licence = {};

        const status = getLicenceStatus(licence);

        expect(status.decisions).to.eql({});
    });

    it('should show no decisions when empty licence.licence', () => {
        const licence = {licence: {}};

        const status = getLicenceStatus(licence);

        expect(status.decisions).to.eql({});
    });

    it('should show all tasks UNSTARTED when empty licence', () => {
        const licence = {};

        const status = getLicenceStatus(licence);

        expect(status.tasks).to.eql({
            exclusion: taskStates.UNSTARTED,
            crdTime: taskStates.UNSTARTED,
            suitability: taskStates.UNSTARTED,
            eligibility: taskStates.UNSTARTED,
            optOut: taskStates.UNSTARTED,
            bassReferral: taskStates.UNSTARTED,
            curfewAddress: taskStates.UNSTARTED,
            riskManagement: taskStates.UNSTARTED,
            curfewAddressReview: taskStates.UNSTARTED,
            curfewHours: taskStates.UNSTARTED,
            reportingInstructions: taskStates.UNSTARTED,
            licenceConditions: taskStates.UNSTARTED,
            seriousOffenceCheck: taskStates.UNSTARTED,
            onRemandCheck: taskStates.UNSTARTED,
            finalChecks: taskStates.UNSTARTED,
            approval: taskStates.UNSTARTED
        });
    });

    it('should show true decisions when decision data is present for truth', () => {
        const licence = {
            status: 'APPROVAL',
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
                        homeVisitConducted: 'Yes'

                    },
                    addressSafety: {
                        deemedSafe: 'Yes'
                    }
                },
                risk: {
                    riskManagement: {
                        planningActions: 'Yes',
                        victimLiaison: 'Yes'
                    }
                },
                finalChecks: {
                    seriousOffence: {
                        decision: 'Yes'
                    },
                    onRemand: {
                        decision: 'Yes'
                    },
                    postpone: {
                        decision: 'Yes'
                    }
                },
                approval: {
                    release: {
                        decision: 'Yes'
                    }
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.decisions.excluded).to.eql(true);
        expect(status.decisions.insufficientTime).to.eql(true);
        expect(status.decisions.unsuitable).to.eql(true);
        expect(status.decisions.optedOut).to.eql(true);
        expect(status.decisions.bassReferralNeeded).to.eql(true);
        expect(status.decisions.curfewAddressApproved).to.eql('approved');
        expect(status.decisions.riskManagementNeeded).to.eql(true);
        expect(status.decisions.victimLiasionNeeded).to.eql(true);
        expect(status.decisions.seriousOffence).to.eql(true);
        expect(status.decisions.onRemand).to.eql(true);
        expect(status.decisions.finalCheckPass).to.eql(false);
        expect(status.decisions.postponed).to.eql(true);
        expect(status.decisions.approved).to.eql(true);
        expect(status.decisions.refused).to.eql(false);
    });

    it('should show licence conditions data', () => {

        const licence = {
            status: 'PROCESSING_RO',
            licence: {
                licenceConditions: {
                    standard: {
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
            status: 'APPROVAL',
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
                curfew: {
                    curfewAddressReview: {
                        consent: 'No'
                    }
                },
                finalChecks: {
                    seriousOffence: {
                        decision: 'No'
                    },
                    onRemand: {
                        decision: 'No'
                    },
                    postpone: {
                        decision: 'No'
                    }
                },
                approval: {
                    release: {
                        decision: 'No'
                    }
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.decisions.excluded).to.eql(false);
        expect(status.decisions.insufficientTime).to.eql(false);
        expect(status.decisions.unsuitable).to.eql(false);
        expect(status.decisions.optedOut).to.eql(false);
        expect(status.decisions.bassReferralNeeded).to.eql(false);
        expect(status.decisions.curfewAddressApproved).to.eql('rejected');
        expect(status.decisions.riskManagementNeeded).to.eql(false);
        expect(status.decisions.victimLiasionNeeded).to.eql(false);
        expect(status.decisions.seriousOffence).to.eql(false);
        expect(status.decisions.onRemand).to.eql(false);
        expect(status.decisions.finalCheckPass).to.eql(true);
        expect(status.decisions.postponed).to.eql(false);
        expect(status.decisions.approved).to.eql(false);
        expect(status.decisions.refused).to.eql(true);
    });

    it('should show eligible when eligibility decisions false', () => {
        const licence = {
            status: 'ELIGIBILITY',
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
            status: 'ELIGIBILITY',
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
            status: 'APPROVAL',
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
        expect(status.tasks.seriousOffenceCheck).to.eql(taskStates.UNSTARTED);
        expect(status.tasks.onRemandCheck).to.eql(taskStates.UNSTARTED);
        expect(status.tasks.finalChecks).to.eql(taskStates.UNSTARTED);
        expect(status.tasks.approval).to.eql(taskStates.UNSTARTED);
    });

    it('should show tasks STARTED when task data incomplete for tasks that can be STARTED', () => {
        const licence = {
            status: 'APPROVAL',
            licence: {
                proposedAddress: {
                    curfewAddress: {
                        addressLine1: 'line'
                    }
                },
                licenceConditions: {
                    standard: {
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
                },
                finalChecks: {
                    seriousOffence: {
                        decision: 'No'
                    }
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.tasks.curfewAddress).to.eql(taskStates.STARTED);
        expect(status.tasks.curfewAddressReview).to.eql(taskStates.STARTED);
        expect(status.tasks.licenceConditions).to.eql(taskStates.STARTED);
        expect(status.tasks.riskManagement).to.eql(taskStates.STARTED);
        expect(status.tasks.finalChecks).to.eql(taskStates.STARTED);
    });

    it('should show tasks DONE when task data complete', () => {
        const licence = {
            status: 'DECIDED',
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
                    },
                    curfewAddress: {
                        addressLine1: 'line',
                        occupier: 'occupier',
                        cautionedAgainstResident: 'Yes'
                    }
                },
                curfew: {
                    curfewAddressReview: {
                        consent: 'Yes',
                        electricity: 'Yes',
                        homeVisitConducted: 'Yes'
                    },
                    addressSafety: {
                        deemedSafe: 'Yes'
                    },
                    curfewHours: 'anything'
                },
                licenceConditions: {
                    standard: {
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
                    reportingInstructions: {
                        name: 'name'
                    }
                },
                finalChecks: {
                    seriousOffence: {
                        decision: 'Yes'
                    },
                    onRemand: {
                        decision: 'Yes'
                    },
                    postpone: {
                        decision: 'Yes'
                    }
                },
                approval: {
                    release: {
                        decision: 'Yes'
                    }
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.tasks.exclusion).to.eql(taskStates.DONE);
        expect(status.tasks.crdTime).to.eql(taskStates.DONE);
        expect(status.tasks.suitability).to.eql(taskStates.DONE);
        expect(status.tasks.eligibility).to.eql(taskStates.DONE);
        expect(status.tasks.optOut).to.eql(taskStates.DONE);
        expect(status.tasks.bassReferral).to.eql(taskStates.DONE);
        expect(status.tasks.curfewAddress).to.eql(taskStates.DONE);
        expect(status.tasks.curfewAddressReview).to.eql(taskStates.DONE);
        expect(status.tasks.curfewHours).to.eql(taskStates.DONE);
        expect(status.tasks.licenceConditions).to.eql(taskStates.DONE);
        expect(status.tasks.riskManagement).to.eql(taskStates.DONE);
        expect(status.tasks.reportingInstructions).to.eql(taskStates.DONE);
        expect(status.tasks.seriousOffenceCheck).to.eql(taskStates.DONE);
        expect(status.tasks.onRemandCheck).to.eql(taskStates.DONE);
        expect(status.tasks.finalChecks).to.eql(taskStates.DONE);
        expect(status.tasks.approval).to.eql(taskStates.DONE);
    });

    it('should show address review DONE when deemed safe is pending', () => {
        const licence = {
            status: 'PROCESSING_CA',
            licence: {
                curfew: {
                    curfewAddressReview: {
                        consent: 'Yes',
                        electricity: 'Yes',
                        homeVisitConducted: 'Yes'
                    },
                    addressSafety: {
                        deemedSafe: 'Yes - pending confirmation of risk management planning'
                    },
                    curfewHours: 'anything'
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.tasks.curfewAddressReview).to.eql(taskStates.DONE);
    });

    it('should show address review APPROVED when deemed safe is pending and home visit is no', () => {
        const licence = {
            status: 'PROCESSING_CA',
            licence: {
                curfew: {
                    curfewAddressReview: {
                        consent: 'Yes',
                        electricity: 'Yes',
                        homeVisitConducted: 'No'
                    },
                    addressSafety: {
                        deemedSafe: 'Yes - pending confirmation of risk management planning'
                    },
                    curfewHours: 'anything'
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.decisions.curfewAddressApproved).to.eql('approved');
    });
});
