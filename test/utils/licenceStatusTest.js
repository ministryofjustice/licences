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

    context('decisions', () => {
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
                        addressProposed: {
                            decision: 'No'
                        },
                        curfewAddress: {
                            addresses: [
                                {
                                    consent: 'Yes',
                                    electricity: 'Yes',
                                    homeVisitConducted: 'Yes',
                                    deemedSafe: 'Yes',
                                    occupier: {
                                        isOffender: 'Yes'
                                    }
                                }
                            ]
                        }
                    },
                    bassReferral: {
                        bassRequest: {
                            bassRequested: 'Yes',
                            town: 'blah',
                            county: 'blah'
                        },
                        bassAreaCheck: {
                            bassAreaSuitable: 'Yes'
                        },
                        bassOffer: {
                            bassAccepted: 'Yes'
                        }
                    },
                    risk: {
                        riskManagement: {
                            planningActions: 'Yes',
                            victimLiaison: 'Yes',
                            awaitingInformation: 'Yes'
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
            expect(status.decisions.bassAreaSuitable).to.eql(true);
            expect(status.decisions.bassAreaNotSuitable).to.eql(false);
            expect(status.decisions.bassAccepted).to.eql('Yes');
            expect(status.decisions.curfewAddressApproved).to.eql('approved');
            expect(status.decisions.riskManagementNeeded).to.eql(true);
            expect(status.decisions.awaitingRiskInformation).to.eql(true);
            expect(status.decisions.victimLiasionNeeded).to.eql(true);
            expect(status.decisions.seriousOffence).to.eql(true);
            expect(status.decisions.onRemand).to.eql(true);
            expect(status.decisions.confiscationOrder).to.eql(true);
            expect(status.decisions.finalChecksPass).to.eql(false);
            expect(status.decisions.postponed).to.eql(true);
            expect(status.decisions.approved).to.eql(true);
            expect(status.decisions.refused).to.eql(false);
            expect(status.decisions.dmRefused).to.eql(false);
            expect(status.decisions.offenderIsMainOccupier).to.eql(true);
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
                    bassReferral: {
                        bassRequest: {
                            bassRequested: 'No'
                        },
                        bassAreaCheck: {
                            bassAreaSuitable: 'No'
                        },
                        bassOffer: {
                            bassAccepted: 'No'
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
            expect(status.decisions.bassAreaSuitable).to.eql(false);
            expect(status.decisions.bassAreaNotSuitable).to.eql(true);
            expect(status.decisions.bassAccepted).to.eql('No');
            expect(status.decisions.curfewAddressApproved).to.eql('rejected');
            expect(status.decisions.riskManagementNeeded).to.eql(false);
            expect(status.decisions.awaitingRiskInformation).to.eql(false);
            expect(status.decisions.victimLiasionNeeded).to.eql(false);
            expect(status.decisions.seriousOffence).to.eql(false);
            expect(status.decisions.onRemand).to.eql(false);
            expect(status.decisions.confiscationOrder).to.eql(false);
            expect(status.decisions.finalChecksPass).to.eql(true);
            expect(status.decisions.postponed).to.eql(false);
            expect(status.decisions.approved).to.eql(false);
            expect(status.decisions.refused).to.eql(true);
            expect(status.decisions.dmRefused).to.eql(true);
            expect(status.decisions.finalChecksRefused).to.eql(false);
            expect(status.decisions.offenderIsMainOccupier).to.eql(false);
        });
    });

    context('tasks', () => {
        it('should show all tasks UNSTARTED when empty licence', () => {
            const licence = {};

            const status = getLicenceStatus(licence);

            expect(status.tasks.exclusion).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.crdTime).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.suitability).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.eligibility).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.optOut).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.bassRequest).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.bassAreaCheck).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.bassOffer).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.curfewAddress).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.curfewAddressReview).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.curfewHours).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.licenceConditions).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.riskManagement).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.reportingInstructions).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.seriousOffenceCheck).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.onRemandCheck).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.confiscationOrderCheck).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.finalChecks).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.approval).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.createLicence).to.eql(taskStates.UNSTARTED);
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
            expect(status.tasks.bassRequest).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.bassAreaCheck).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.bassOffer).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.curfewAddress).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.curfewAddressReview).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.curfewHours).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.licenceConditions).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.riskManagement).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.reportingInstructions).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.seriousOffenceCheck).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.onRemandCheck).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.confiscationOrderCheck).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.finalChecks).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.approval).to.eql(taskStates.UNSTARTED);
            expect(status.tasks.createLicence).to.eql(taskStates.UNSTARTED);
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
                    bassReferral: {
                        bassRequest: {
                            bassRequested: 'Yes',
                            town: 'blah',
                            county: 'blah'
                        },
                        bassAreaCheck: {
                            bassAreaSuitable: 'Yes'
                        },
                        bassOffer: {
                            bassAccepted: 'Yes'
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
            expect(status.tasks.bassOffer).to.eql(taskStates.STARTED);
            expect(status.tasks.curfewAddressReview).to.eql(taskStates.STARTED);
            expect(status.tasks.licenceConditions).to.eql(taskStates.STARTED);
            expect(status.tasks.riskManagement).to.eql(taskStates.STARTED);
            expect(status.tasks.finalChecks).to.eql(taskStates.STARTED);
        });

        it('should show tasks DONE when task data complete', () => {
            const licence = {
                stage: 'DECIDED',
                approvedVersion: 1,
                version: 1,
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
                    bassReferral: {
                        bassRequest: {
                            bassRequested: 'Yes',
                            town: 'blah',
                            county: 'blah'
                        },
                        bassAreaCheck: {
                            bassAreaSuitable: 'Yes'
                        },
                        bassOffer: {
                            bassAccepted: 'No'
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
            expect(status.tasks.bassRequest).to.eql(taskStates.DONE);
            expect(status.tasks.bassAreaCheck).to.eql(taskStates.DONE);
            expect(status.tasks.bassOffer).to.eql(taskStates.DONE);
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
            expect(status.tasks.createLicence).to.eql(taskStates.DONE);
        });
    });

    context('APPROVAL', () => {
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

            expect(status.decisions.refused).to.eql(true);
            expect(status.decisions.finalChecksRefused).to.eql(true);
            expect(status.decisions.dmRefused).to.eql(false);
        });
    });

    context('PROCESSING_RO', () => {
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
                                    deemedSafe: 'Yes'
                                },
                                {
                                    consent: 'Yes',
                                    electricity: 'Yes',
                                    homeVisitConducted: 'No',
                                    deemedSafe: 'Yes'
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

        it('should show bassAreaCheck UNSTARTED when empty', () => {
            const licence = {
                stage: 'PROCESSING_RO',
                licence: {
                    bassReferral: {
                        bassAreaCheck: {
                        }
                    }
                }
            };

            const status = getLicenceStatus(licence);

            expect(status.tasks.bassAreaCheck).to.eql(taskStates.UNSTARTED);
            expect(status.decisions.bassAreaSuitable).to.eql(undefined);
        });

        it('should show bassAreaCheck STARTED when unsuitable and no reason', () => {
            const licence = {
                stage: 'PROCESSING_RO',
                licence: {
                    bassReferral: {
                        bassAreaCheck: {
                            bassAreaSuitable: 'No'
                        }
                    }
                }
            };

            const status = getLicenceStatus(licence);

            expect(status.tasks.bassAreaCheck).to.eql(taskStates.STARTED);
            expect(status.decisions.bassAreaSuitable).to.eql(false);
        });

        it('should show bassAreaCheck DONE when unsuitable with reason', () => {
            const licence = {
                stage: 'PROCESSING_RO',
                licence: {
                    bassReferral: {
                        bassAreaCheck: {
                            bassAreaSuitable: 'No',
                            bassAreaReason: 'reason'
                        }
                    }
                }
            };

            const status = getLicenceStatus(licence);

            expect(status.tasks.bassAreaCheck).to.eql(taskStates.DONE);
            expect(status.decisions.bassAreaNotSuitable).to.eql(true);
        });
    });

    context('ELIGIBILITY', () => {
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
    });

    context('Post-decision', () => {

        it('should show createLicence task UNSTARTED when no approved version', () => {
            const licence = {
                stage: 'DECIDED',
                version: 1,
                licence: {
                    notEmpty: true
                }
            };

            const status = getLicenceStatus(licence);

            expect(status.tasks.createLicence).to.eql(taskStates.UNSTARTED);
        });

        it('should show createLicence task UNSTARTED when working version higher than approved version', () => {
            const licence = {
                stage: 'DECIDED',
                version: 2,
                approvedVersion: 1,
                licence: {
                    notEmpty: true
                }
            };

            const status = getLicenceStatus(licence);

            expect(status.tasks.createLicence).to.eql(taskStates.UNSTARTED);
        });

        it('should show createLicence task DONE when working version is the same as approved version', () => {
            const licence = {
                stage: 'DECIDED',
                version: 2,
                approvedVersion: 2,
                licence: {
                    notEmpty: true
                }
            };

            const status = getLicenceStatus(licence);

            expect(status.tasks.createLicence).to.eql(taskStates.DONE);
        });
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
                        exceptionalCircumstances: {}
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

    context('Eligibility - Proposed Address', () => {

        it('should show curfew address DONE when opted out', () => {
            const licence = {
                stage: 'PROCESSING_CA',
                licence: {proposedAddress: {optOut: {decision: 'Yes'}}}
            };

            const status = getLicenceStatus(licence);
            expect(status.tasks.curfewAddress).to.eql(taskStates.DONE);
        });

        it('should show curfew address DONE when bass referral needed', () => {
            const licence = {
                stage: 'PROCESSING_CA',
                licence: {proposedAddress: {addressProposed: {decision: 'No'}}, bassReferral: {bassRequest: {bassRequested: 'Yes'}}}
            };

            const status = getLicenceStatus(licence);
            expect(status.tasks.curfewAddress).to.eql(taskStates.DONE);
        });

        it('should show curfew address UNSTARTED when no addresses', () => {
            const licence = {
                stage: 'PROCESSING_CA',
                licence: {proposedAddress: {}}
            };

            const status = getLicenceStatus(licence);
            expect(status.tasks.curfewAddress).to.eql(taskStates.UNSTARTED);
        });

        it('should show curfew address DONE when minimum fields not empty', () => {
            const licence = {
                stage: 'PROCESSING_CA',
                licence: {
                    proposedAddress: {
                        curfewAddress: {
                            addresses: [{
                                addressLine1: 'a',
                                addressTown: 'b',
                                postCode: 'c',
                                telephone: 'd',
                                cautionedAgainstResident: 'e'
                            }]
                        }
                    }
                }
            };

            const status = getLicenceStatus(licence);
            expect(status.tasks.curfewAddress).to.eql(taskStates.DONE);
        });

        it('should show curfew address STARTED if any of minimum fields empty', () => {
            const licence = {
                stage: 'PROCESSING_CA',
                licence: {
                    proposedAddress: {
                        curfewAddress: {
                            addresses: [{
                                addressLine1: '',
                                addressTown: 'b',
                                postCode: 'c',
                                telephone: 'd',
                                cautionedAgainstResident: 'e'
                            }]
                        }
                    }
                }
            };

            const status = getLicenceStatus(licence);
            expect(status.tasks.curfewAddress).to.eql(taskStates.STARTED);
        });
    });
});
