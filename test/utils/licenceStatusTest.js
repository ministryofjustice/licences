const {getLicenceStatus} = require('../../server/utils/licenceStatus');
const {taskStates} = require('../../server/models/taskStates');

describe('getLicenceStatus', () => {

    it('should show licence stage', () => {
        const licence = {
            stage: 'ELIGIBILITY',
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
            confiscationOrderCheck: taskStates.UNSTARTED,
            finalChecks: taskStates.UNSTARTED,
            approval: taskStates.UNSTARTED
        });
    });

    it('should show true decisions when decision data is present for truth', () => {
        const licence = {
            stage: 'APPROVAL',
            licence: {
                eligibility: {
                    excluded: {
                        decision: 'Yes'
                    },
                    suitability: {
                        decision: 'Yes'
                    },
                    exceptionalCircumstances: {
                        decision: 'No'
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
                    },
                    addressProposed: {
                        decision: 'No'
                    },
                    curfewAddress: {
                        addresses: [
                            {
                                consent: 'Yes',
                                electricity: 'Yes',
                                homeVisitConducted: 'Yes',
                                deemedSafe: 'Yes'
                            }
                        ]
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
                    confiscationOrder: {
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
        expect(status.decisions.unsuitableResult).to.eql(true);
        expect(status.decisions.optedOut).to.eql(true);
        expect(status.decisions.bassReferralNeeded).to.eql(true);
        expect(status.decisions.curfewAddressApproved).to.eql('approved');
        expect(status.decisions.riskManagementNeeded).to.eql(true);
        expect(status.decisions.victimLiasionNeeded).to.eql(true);
        expect(status.decisions.seriousOffence).to.eql(true);
        expect(status.decisions.onRemand).to.eql(true);
        expect(status.decisions.confiscationOrder).to.eql(true);
        expect(status.decisions.finalChecksPass).to.eql(false);
        expect(status.decisions.postponed).to.eql(true);
        expect(status.decisions.approved).to.eql(true);
        expect(status.decisions.refused).to.eql(false);
    });

    it('should account for refusal from ca as well as dm', () => {
        const licence = {
            stage: 'APPROVAL',
            licence: {
                finalChecks: {
                    seriousOffence: {
                        decision: 'Yes'
                    },
                    onRemand: {
                        decision: 'Yes'
                    },
                    confiscationOrder: {
                        decision: 'Yes'
                    },
                    postpone: {
                        decision: 'Yes'
                    },
                    refusal: {
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

        expect(status.decisions.approved).to.eql(false);
        expect(status.decisions.finalChecksRefused).to.eql(true);
    });

    it('should show licence conditions data', () => {

        const licence = {
            stage: 'PROCESSING_RO',
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
            stage: 'APPROVAL',
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
                    },
                    curfewAddress: {
                        addresses: [
                            {
                                consent: 'No',
                                electricity: 'Yes',
                                homeVisitConducted: 'Yes',
                                deemedSafe: 'Yes'
                            }
                        ]
                    }
                },
                finalChecks: {
                    seriousOffence: {
                        decision: 'No'
                    },
                    onRemand: {
                        decision: 'No'
                    },
                    confiscationOrder: {
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
        expect(status.decisions.unsuitableResult).to.eql(false);
        expect(status.decisions.optedOut).to.eql(false);
        expect(status.decisions.bassReferralNeeded).to.eql(false);
        expect(status.decisions.curfewAddressApproved).to.eql('rejected');
        expect(status.decisions.riskManagementNeeded).to.eql(false);
        expect(status.decisions.victimLiasionNeeded).to.eql(false);
        expect(status.decisions.seriousOffence).to.eql(false);
        expect(status.decisions.onRemand).to.eql(false);
        expect(status.decisions.confiscationOrder).to.eql(false);
        expect(status.decisions.finalChecksPass).to.eql(true);
        expect(status.decisions.postponed).to.eql(false);
        expect(status.decisions.approved).to.eql(false);
        expect(status.decisions.refused).to.eql(true);
        expect(status.decisions.finalChecksRefused).to.eql(false);
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
            confiscationOrderCheck: taskStates.UNSTARTED,
            finalChecks: taskStates.UNSTARTED,
            approval: taskStates.UNSTARTED
        });
    });

    it('should show unsuitableResult true when unsuitable and no exceptional circumstances', () => {
        const licence = {
            stage: 'APPROVAL',
            licence: {
                eligibility: {
                    excluded: {
                        decision: 'Yes'
                    },
                    suitability: {
                        decision: 'Yes'
                    },
                    exceptionalCircumstances: {
                        decision: 'No'
                    },
                    crdTime: {
                        decision: 'Yes'
                    }
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.decisions.unsuitableResult).to.eql(true);
    });

    it('should show NOT unsuitableResult true when unsuitable and there are exceptional circumstances', () => {
        const licence = {
            stage: 'APPROVAL',
            licence: {
                eligibility: {
                    excluded: {
                        decision: 'Yes'
                    },
                    suitability: {
                        decision: 'Yes'
                    },
                    exceptionalCircumstances: {
                        decision: 'Yes'
                    },
                    crdTime: {
                        decision: 'Yes'
                    }
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.decisions.unsuitableResult).to.eql(false);
    });

    it('should show eligible when eligibility decisions false', () => {
        const licence = {
            stage: 'ELIGIBILITY',
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
            stage: 'ELIGIBILITY',
            licence: {
                eligibility: {
                    excluded: {
                        decision: 'No'
                    },
                    suitability: {
                        decision: 'Yes'
                    },
                    exceptionalCircumstances: {
                        decision: 'No'
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

    it('should show eligible when unsuitable but exceptional circumstances', () => {
        const licence = {
            stage: 'ELIGIBILITY',
            licence: {
                eligibility: {
                    excluded: {
                        decision: 'No'
                    },
                    suitability: {
                        decision: 'Yes'
                    },
                    exceptionalCircumstances: {
                        decision: 'Yes'
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


    it('should show tasks UNSTARTED when task data missing', () => {
        const licence = {
            stage: 'APPROVAL',
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
            stage: 'APPROVAL',
            licence: {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {
                                addressLine1: 'line',
                                consent: 'Yes',
                                electricity: 'Yes',
                                homeVisitConducted: 'Yes'
                            }
                        ]
                    }
                },
                licenceConditions: {
                    standard: {
                        additionalConditionsRequired: 'Yes'
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
            stage: 'DECIDED',
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
                    exceptionalCircumstances: {
                        decision: 'Yes'
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
                        addresses: [
                            {
                                addressLine1: 'line',
                                occupier: 'occupier',
                                cautionedAgainstResident: 'Yes',
                                consent: 'Yes',
                                electricity: 'Yes',
                                homeVisitConducted: 'Yes',
                                deemedSafe: 'Yes'
                            }
                        ]
                    }
                },
                curfew: {
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
                        name: 'name',
                        buildingAndStreet1: 1,
                        townOrCity: 2,
                        postcode: 3,
                        telephone: 4
                    }
                },
                finalChecks: {
                    seriousOffence: {
                        decision: 'Yes'
                    },
                    onRemand: {
                        decision: 'Yes'
                    },
                    confiscationOrder: {
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
        expect(status.tasks.confiscationOrderCheck).to.eql(taskStates.DONE);
        expect(status.tasks.finalChecks).to.eql(taskStates.DONE);
        expect(status.tasks.approval).to.eql(taskStates.DONE);
    });

    it('should show address review DONE when deemed safe is pending', () => {
        const licence = {
            stage: 'PROCESSING_CA',
            licence: {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {
                                consent: 'Yes',
                                electricity: 'Yes',
                                homeVisitConducted: 'Yes',
                                deemedSafe: 'Yes - pending confirmation of risk management planning'
                            }
                        ]
                    }
                },
                curfew: {
                    curfewHours: 'anything'
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.tasks.curfewAddressReview).to.eql(taskStates.DONE);
    });

    it('should show address review APPROVED when deemed safe is pending and home visit is no', () => {
        const licence = {
            stage: 'PROCESSING_CA',
            licence: {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {
                                consent: 'Yes',
                                electricity: 'Yes',
                                homeVisitConducted: 'No',
                                deemedSafe: 'Yes - pending confirmation of risk management planning'
                            }
                        ]
                    }
                },
                curfew: {
                    curfewHours: 'anything'
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.decisions.curfewAddressApproved).to.eql('approved');
    });

    it('should show address review APPROVED when any address is approved', () => {
        const licence = {
            stage: 'PROCESSING_CA',
            licence: {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {
                                consent: 'No',
                                electricity: 'Yes',
                                homeVisitConducted: 'No',
                                deemedSafe: 'Yes - pending confirmation of risk management planning'
                            },
                            {
                                consent: 'Yes',
                                electricity: 'Yes',
                                homeVisitConducted: 'No',
                                deemedSafe: 'Yes - pending confirmation of risk management planning'
                            }
                        ]
                    }
                },
                curfew: {
                    curfewHours: 'anything'
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.decisions.curfewAddressApproved).to.eql('approved');
    });

    it('should show address review WITHDRAWN when addressWithdrawn is yes', () => {
        const licence = {
            stage: 'PROCESSING_CA',
            licence: {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {
                                consent: 'Yes',
                                electricity: 'Yes',
                                homeVisitConducted: 'Yes',
                                deemedSafe: 'Yes',
                                addressWithdrawn: 'Yes'
                            }
                        ]
                    }
                },
                curfew: {
                    curfewHours: 'anything'
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.decisions.curfewAddressApproved).to.eql('withdrawn');
    });

    it('should show address review REJECTED when deemed safe is no', () => {
        const licence = {
            stage: 'PROCESSING_CA',
            licence: {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {
                                consent: 'Yes',
                                electricity: 'Yes',
                                homeVisitConducted: 'No',
                                deemedSafe: 'No'
                            }
                        ]
                    }
                },
                curfew: {
                    curfewHours: 'anything'
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.decisions.curfewAddressApproved).to.eql('rejected');
    });

    it('should show address review UNSTARTED when there are active addresses', () => {
        const licence = {
            stage: 'PROCESSING_CA',
            licence: {
                proposedAddress: {
                    curfewAddress: {
                        addresses: [
                            {
                                consent: 'Yes',
                                electricity: 'Yes',
                                homeVisitConducted: 'No',
                                deemedSafe: 'No'
                            },
                            {
                                addressLine1: 'a'
                            }
                        ]
                    }
                },
                curfew: {
                    curfewHours: 'anything'
                }
            }
        };

        const status = getLicenceStatus(licence);

        expect(status.tasks.curfewAddressReview).to.eql(taskStates.UNSTARTED);
        expect(status.decisions.curfewAddressApproved).to.eql('unstarted');
    });

    context('Eligibility', () => {
        it('should show eligibility DONE when excluded is YES', () => {
            const licence = {
                stage: 'PROCESSING_CA',
                licence: {
                    eligibility: {
                        excluded: {
                            decision: 'Yes'
                        }

                    }
                }
            };

            const status = getLicenceStatus(licence);

            expect(status.tasks.eligibility).to.eql(taskStates.DONE);
        });

        it('should show eligibility DONE when (un)suitabililty is YES and exceptionalCircumstances is answered', () => {
            const licence = {
                stage: 'PROCESSING_CA',
                licence: {
                    eligibility: {
                        excluded: {
                            decision: 'No'
                        },
                        suitability: {
                            decision: 'Yes'
                        },
                        exceptionalCircumstances: {
                            decision: 'No'
                        }
                    }
                }
            };

            const status = getLicenceStatus(licence);

            expect(status.tasks.eligibility).to.eql(taskStates.DONE);
        });

        it('should show eligibility STARTED when (un)suitabililty is YES and exceptionalCircumstances missing', () => {
            const licence = {
                stage: 'PROCESSING_CA',
                licence: {
                    eligibility: {
                        excluded: {
                            decision: 'No'
                        },
                        suitability: {
                            decision: 'Yes'
                        },
                        exceptionalCircumstances: {
                        }
                    }
                }
            };

            const status = getLicenceStatus(licence);

            expect(status.tasks.eligibility).to.eql(taskStates.STARTED);
        });

        it('should show eligibility STARTED when (un)suitabililty is No and excluded is No but no crdTime', () => {
            const licence = {
                stage: 'PROCESSING_CA',
                licence: {
                    eligibility: {
                        excluded: {
                            decision: 'No'
                        },
                        suitability: {
                            decision: 'No'
                        }
                    }
                }
            };

            const status = getLicenceStatus(licence);

            expect(status.tasks.eligibility).to.eql(taskStates.STARTED);
        });

        it('should show eligibility DONE when suitability is No and excluded is No but and complete crdTime', () => {
            const licence = {
                stage: 'PROCESSING_CA',
                licence: {
                    eligibility: {
                        excluded: {
                            decision: 'No'
                        },
                        suitability: {
                            decision: 'No'
                        },
                        crdTime: {
                            decision: 'Yes',
                            dmApproval: 'No'
                        }
                    }
                }
            };

            const status = getLicenceStatus(licence);

            expect(status.tasks.eligibility).to.eql(taskStates.DONE);
        });
    });
});
