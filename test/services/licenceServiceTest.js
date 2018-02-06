const createLicenceService = require('../../server/services/licenceService');
const {expect, sandbox} = require('../testSetup');

describe('licenceService', () => {

    const aLicence = {a: 'b', licence: {agencyLocationId: '123'}};

    const licenceClient = {
        getLicence: sandbox.stub().returnsPromise().resolves({licence: {a: 'b'}}),
        createLicence: sandbox.stub().returnsPromise().resolves('abc'),
        updateSection: sandbox.stub().returnsPromise().resolves(),
        updateStatus: sandbox.stub().returnsPromise().resolves(),
        getAdditionalConditions: sandbox.stub().returnsPromise().resolves([
            {USER_INPUT: {value: 1}, ID: {value: 1}, FIELD_POSITION: {value: null}}]),
        updateLicence: sandbox.stub().returnsPromise().resolves()
    };

    const establishmentsClient = {
        findById: sandbox.stub().returnsPromise().resolves({a: 'b'})
    };

    const service = createLicenceService(licenceClient, establishmentsClient);

    afterEach(() => {
        sandbox.reset();
    });

    describe('getLicence', () => {
        it('should request licence details from client', () => {
            service.getLicence('123');

            expect(licenceClient.getLicence).to.be.calledOnce();
            expect(licenceClient.getLicence).to.be.calledWith('123');
        });

        it('should return licence', () => {
            return expect(service.getLicence('123')).to.eventually.eql({licence: {a: 'b'}, status: undefined});
        });

        it('should addAdditionalConditions if they are present in licence and requested', () => {
            licenceClient.getLicence.resolves({licence: {additionalConditions: {1: {}}}});
            licenceClient.getAdditionalConditions.resolves([{
                ID: {value: 1},
                USER_INPUT: {value: null},
                TEXT: {value: 'The condition'},
                FIELD_POSITION: {value: null},
                GROUP_NAME: {value: 'group'},
                SUBGROUP_NAME: {value: 'subgroup'}}]);

            return expect(service.getLicence('123', {populateConditions: true})).to.eventually.eql({
                licence: {
                    additionalConditions: [{content: [{text: 'The condition'}],
                    group: 'group',
                    subgroup: 'subgroup'}]
                },

                status: undefined
            });
        });

        it('should not addAdditionalConditions if they are present in licence but not requested', () => {
            licenceClient.getLicence.resolves({licence: {additionalConditions: {1: {}}}});
            licenceClient.getAdditionalConditions.resolves([{
                ID: {value: 1},
                USER_INPUT: {value: null},
                TEXT: {value: 'The condition'},
                FIELD_POSITION: {value: null}}]);

            return expect(service.getLicence('123')).to.eventually.eql({
                licence: {
                    additionalConditions: {1: {}}
                }, status: undefined
            });
        });

        it('should throw if error getting licence', () => {
            licenceClient.getLicence.rejects();
            return expect(service.getLicence('123')).to.eventually.be.rejected();
        });
    });

    describe('createLicence', () => {
        it('should create a licence', () => {
            service.createLicence('123');

            expect(licenceClient.createLicence).to.be.calledOnce();
            expect(licenceClient.createLicence).to.be.calledWith('123', {});
        });

        it('should pass in a valid licence', () => {
            service.createLicence('123', {firstName: 'M', bad: '1'});

            expect(licenceClient.createLicence).to.be.calledOnce();
            expect(licenceClient.createLicence).to.be.calledWith('123', {firstName: 'M'});
        });

        it('should return returned id', () => {
            return expect(service.createLicence('123')).to.eventually.eql('abc');
        });

        it('should throw if error getting licence', () => {
            licenceClient.createLicence.rejects();
            return expect(service.createLicence('123')).to.eventually.be.rejected();
        });
    });

    describe('updatesAddress', () => {
        it('should call updateAddress from the licence client', () => {
            service.updateAddress({nomisId: 'ab1', address1: 'Scotland Street'});

            expect(licenceClient.updateSection).to.be.calledOnce();
            expect(licenceClient.updateSection).to.be.calledWith(
                'curfewAddress',
                'ab1',
                {address1: 'Scotland Street'}
            );
        });

        it('should throw if error updating licence', () => {
            licenceClient.updateSection.rejects();
            const args = {nomisId: 'ab1', address1: 'Scotland Street'};
            return expect(service.updateAddress(args)).to.eventually.be.rejected();
        });
    });

    describe('updatesReportingInstructions', () => {
        it('should call updatesReportingInstructions from the licence client', () => {
            service.updateReportingInstructions({nomisId: 'ab1', address1: 'Scotland Street'});

            expect(licenceClient.updateSection).to.be.calledOnce();
            expect(licenceClient.updateSection).to.be.calledWith(
                'reportingInstructions',
                'ab1',
                {address1: 'Scotland Street'}
            );
        });

        it('should throw if error updating licence', () => {
            licenceClient.updateSection.rejects();
            const args = {nomisId: 'ab1', address1: 'Scotland Street'};
            return expect(service.updateReportingInstructions(args)).to.eventually.be.rejected();
        });
    });

    describe('updateLicenceConditions', () => {

        it('should get the selected licence conditions', () => {
            service.updateLicenceConditions({nomisId: 'ab1', additionalConditions: ['Scotland Street']});

            expect(licenceClient.getAdditionalConditions).to.be.calledOnce();
            expect(licenceClient.getAdditionalConditions).to.be.calledWith(['Scotland Street']);
        });

        it('should call update section with additional conditions from the licence client', async () => {
            licenceClient.getAdditionalConditions.resolves([
                {USER_INPUT: {value: 1}, ID: {value: 1}, FIELD_POSITION: {value: null}}]);

            await service.updateLicenceConditions({nomisId: 'ab1', additionalConditions: ['Scotland Street']});

            expect(licenceClient.updateSection).to.be.calledOnce();
            expect(licenceClient.updateSection).to.be.calledWith(
                'additionalConditions',
                'ab1',
                {1: {}}
            );
        });

        it('should throw if error updating licence', () => {
            licenceClient.updateSection.rejects();
            const args = {nomisId: 'ab1', additionalConditions: ['Scotland Street']};
            return expect(service.updateLicenceConditions(args)).to.eventually.be.rejected();
        });
    });

    describe('updateEligibility', () => {
        it('should call updateEligibility from the licence client', () => {
            service.updateEligibility({nomisId: 'ab1', excluded: 'true'});

            expect(licenceClient.updateSection).to.be.calledOnce();
            expect(licenceClient.updateSection).to.be.calledWith(
                'eligibility',
                'ab1',
                {excluded: 'true'},
                'ELIGIBILITY_CHECKED'
            );
        });

        it('should merge eligibility object with existing data', () => {
            const input = {nomisId: 'ab1', crdTime: 'No', unsuitable: 'No'};
            const existingObject = {excluded: 'Yes'};
            service.updateEligibility(input, existingObject);

            expect(licenceClient.updateSection).to.be.calledWith(
                'eligibility',
                'ab1',
                {crdTime: 'No', excluded: 'Yes'},
                'ELIGIBILITY_CHECKED'
            );
        });

        it('should overwrite changed values', () => {
            const input = {nomisId: 'ab1', excluded: 'No'};
            const existingObject = {excluded: 'Yes'};
            service.updateEligibility(input, existingObject);

            expect(licenceClient.updateSection).to.be.calledWith(
                'eligibility',
                'ab1',
                {excluded: 'No'},
                'ELIGIBILITY_CHECKED'
            );
        });

        it('should throw if error updating licence', () => {
            licenceClient.updateSection.rejects();
            const args = {nomisId: 'ab1', excluded: 'true'};
            return expect(service.updateEligibility(args)).to.eventually.be.rejected();
        });
    });

    describe('sendToOmu', () => {
        it('should call updateStatus from the licence client', () => {
            service.sendToOmu('ab1');

            expect(licenceClient.updateStatus).to.be.calledOnce();
            expect(licenceClient.updateStatus).to.be.calledWith('ab1', 'SENT');
        });

        it('should throw if error during update status', () => {
            licenceClient.updateStatus.rejects();
            return expect(service.sendToOmu('ab1')).to.eventually.be.rejected();
        });
    });

    describe('sendToPm', () => {
        it('should call updateStatus from the licence client', () => {
            service.sendToPm('ab1');

            expect(licenceClient.updateStatus).to.be.calledOnce();
            expect(licenceClient.updateStatus).to.be.calledWith('ab1', 'CHECK_SENT');
        });

        it('should throw if error during update status', () => {
            licenceClient.updateStatus.rejects();
            return expect(service.sendToPm('ab1')).to.eventually.be.rejected();
        });
    });

    describe('getEstablishment', () => {
        it('should call getEstablishment from the establishments client', async () => {

            licenceClient.getLicence.resolves(aLicence);

            await service.getEstablishment('ab1');

            expect(licenceClient.getLicence).to.be.calledOnce();
            expect(licenceClient.getLicence).to.be.calledWith('ab1');
            expect(establishmentsClient.findById).to.be.calledOnce();
            expect(establishmentsClient.findById).to.be.calledWith('123');
        });

        it('should throw if error during findById', () => {
            establishmentsClient.findById.rejects();
            return expect(service.getEstablishment('ab1')).to.eventually.be.rejected();
        });
    });

    describe('update', () => {

        const nomisId = 'ab1';

        const baseLicence = {
            section1: '',
            section2: '',
            section3: {},
            section4: {
                form1: {},
                form2: {answer: 'answer'}
            }
        };

        context('When there are dependents', () => {
            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4,
                    form3: {
                        decision: '',
                        followUp1: '',
                        followUp2: ''
                    }
                }

            };

            const fieldMap = [
                {decision: {}},
                {followUp1: {
                    dependentOn: 'decision',
                    predicate: 'Yes'}
                },
                {followUp2: {
                    dependentOn: 'decision',
                    predicate: 'Yes'}
                }

            ];

            it('should store dependents if predicate matches', async () => {
                const userInput = {
                    decision: 'Yes',
                    followUp1: 'County',
                    followUp2: 'Town'
                };

                const licenceSection = 'section4';
                const formName= 'form3';

                const output = await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

                expect(output).to.eql({
                    ...licence,
                    section4: {
                        ...licence.section4,
                        form3: {
                            decision: 'Yes',
                            followUp1: 'County',
                            followUp2: 'Town'
                        }
                    }
                });
            });

            it('should remove dependents if predicate does not match', async () => {
                const userInput = {
                    decision: 'No',
                    followUp1: 'County',
                    followUp2: 'Town'
                };

                const licenceSection = 'section4';
                const formName = 'form3';

                const output = await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

                expect(output).to.eql({
                    ...licence,
                    section4: {
                        ...licence.section4,
                        form3: {
                            decision: 'No'
                        }
                    }
                });
            });
        });

        context('When there are no dependents', () => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4,
                    form3: {
                        decision: '',
                        followUp1: '',
                        followUp2: ''
                    }
                }

            };

            const fieldMap = [
                {decision: {}},
                {followUp1: {}},
                {followUp2: {}}
            ];

            it('should store everything', async () => {
                const userInput = {
                    decision: 'Yes',
                    followUp1: 'County',
                    followUp2: 'Town'
                };

                const licenceSection = 'section4';
                const formName = 'form3';

                const output = await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

                expect(output).to.eql({
                    ...licence,
                    section4: {
                        ...licence.section4,
                        form3: {
                            decision: 'Yes',
                            followUp1: 'County',
                            followUp2: 'Town'
                        }
                    }
                });
            });
        });
        it('should call updateLicence and pass in the licence', async() => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4,
                    form3: {
                        decision: '',
                        followUp1: '',
                        followUp2: ''
                    }
                }

            };

            const fieldMap = [
                {decision: {}},
                {followUp1: {}},
                {followUp2: {}}
            ];

            const userInput = {
                decision: 'Yes',
                followUp1: 'County',
                followUp2: 'Town'
            };

            const licenceSection = 'section4';
            const formName = 'form3';

            await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

            const expectedLicence = {
                ...licence,
                section4: {
                    ...licence.section4,
                    form3: {
                        decision: 'Yes',
                        followUp1: 'County',
                        followUp2: 'Town'
                    }
                }
            };
            expect(licenceClient.updateLicence).to.be.calledOnce();
            expect(licenceClient.updateLicence).to.be.calledWith('ab1', expectedLicence);
        });

        it('should add new form to the licence', async() => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4
                }

            };

            const fieldMap = [
                {decision: {}},
                {followUp1: {}},
                {followUp2: {}}
            ];

            const userInput = {
                decision: 'Yes',
                followUp1: 'County',
                followUp2: 'Town'
            };

            const licenceSection = 'section4';
            const formName = 'form3';

            const output = await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

            const expectedLicence = {
                ...licence,
                section4: {
                    ...licence.section4,
                    form3: {
                        decision: 'Yes',
                        followUp1: 'County',
                        followUp2: 'Town'
                    }
                }
            };
            expect(output).to.eql(expectedLicence);
        });

        it('should add new section to the licence', async() => {

            const licence = {
                ...baseLicence,
                section4: {
                    ...baseLicence.section4
                }

            };

            const fieldMap = [
                {decision: {}},
                {followUp1: {}},
                {followUp2: {}}
            ];

            const userInput = {
                decision: 'Yes',
                followUp1: 'County',
                followUp2: 'Town'
            };

            const licenceSection = 'section5';
            const formName = 'form3';

            const output = await service.update({nomisId, licence, fieldMap, userInput, licenceSection, formName});

            const expectedLicence = {
                ...licence,
                section5: {
                    form3: {
                        decision: 'Yes',
                        followUp1: 'County',
                        followUp2: 'Town'
                    }
                }
            };
            expect(output).to.eql(expectedLicence);
        });
    });
});
