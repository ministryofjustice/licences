const {formatObjectForView, formatObjectForViewWithOptions} = require('../../../server/services/utils/formatForView');

describe('formatForView', () => {
    describe('dates', () => {
        it('should format passed in dates', () => {
            const object = {
                a: 'hi',
                b: 'ho',
                c: '1971-05-12'
            };

            const expectedOutput = {
                a: 'hi',
                b: 'ho',
                c: '12/05/1971'
            };

            expect(formatObjectForViewWithOptions(object, {dates: ['c']})).to.eql(expectedOutput);
        });

        it('should format passed in dates when more than one', () => {
            const object = {
                a: '1985-12-23',
                b: 'hi',
                c: 'ho',
                d: '1971-05-12'
            };

            const expectedOutput = {
                a: '23/12/1985',
                b: 'hi',
                c: 'ho',
                d: '12/05/1971'
            };

            expect(formatObjectForViewWithOptions(object, {dates: ['a', 'd']})).to.eql(expectedOutput);
        });

        it('should format nested dates', () => {
            const object = {
                a: '1985-12-23',
                b: {o: 'hi'},
                c: 'ho',
                d: {e: {f: '1971-05-12'}}
            };

            const expectedOutput = {
                a: '23/12/1985',
                b: {o: 'Hi'},
                c: 'ho',
                d: {e: {f: '12/05/1971'}}
            };

            expect(formatObjectForViewWithOptions(object, {dates: ['a', 'f'], capitalise: ['o']}))
                .to.eql(expectedOutput);
        });
    });

    describe('names', () => {
        it('should format names to be capitalised', () => {
            const object = {
                a: '1985-12-23',
                b: 'hi',
                c: 'ho',
                d: '1971-05-12'
            };

            const expectedOutput = {
                a: '23/12/1985',
                b: 'Hi',
                c: 'ho',
                d: '12/05/1971'
            };

            expect(formatObjectForViewWithOptions(object, {dates: ['a', 'd'], capitalise: ['b']}))
                .to.eql(expectedOutput);
        });

        it('should format nested names to be capitalised', () => {
            const object = {
                a: '1985-12-23',
                b: {o: 'hi'},
                c: 'ho',
                d: '1971-05-12'
            };

            const expectedOutput = {
                a: '23/12/1985',
                b: {o: 'Hi'},
                c: 'ho',
                d: '12/05/1971'
            };

            expect(formatObjectForViewWithOptions(object, {dates: ['a', 'd'], capitalise: ['o']}))
                .to.eql(expectedOutput);
        });


    });

    describe('location', () => {

        it('should remove (HMP) and add prefix HMP', () => {

            const object = {agencyLocationDesc: 'Berwyn (HMP)'};
            const expectedOutput = {agencyLocationDesc: 'HMP Berwyn'};

            expect(formatObjectForView(object)).to.eql(expectedOutput);
        });
    });

    describe('com', () => {

        it('should extract first coms first and last name and capitalise', () => {

            const object = {com: [{firstName: 'first', lastName: 'last'}]};
            const expectedOutput = {com: 'First Last'};

            expect(formatObjectForView(object)).to.eql(expectedOutput);
        });

        it('should give empty if com list missing', () => {

            const object = {com: undefined};
            const expectedOutput = {com: ''};

            expect(formatObjectForView(object)).to.eql(expectedOutput);
        });

        it('should give empty if com list empty', () => {

            const object = {com: []};
            const expectedOutput = {com: ''};

            expect(formatObjectForView(object)).to.eql(expectedOutput);
        });
    });

    describe('offences', () => {

        it('should extract first offence description', () => {

            const object = {offences: [{offenceDescription: 'first'}, {offenceDescription: 'second'}]};
            const expectedOutput = {offences: 'first'};

            expect(formatObjectForView(object)).to.eql(expectedOutput);
        });

        it('should give empty if offence list missing', () => {

            const object = {offences: undefined};
            const expectedOutput = {offences: ''};

            expect(formatObjectForView(object)).to.eql(expectedOutput);
        });

        it('should give empty if offence list empty', () => {

            const object = {offences: []};
            const expectedOutput = {offences: ''};

            expect(formatObjectForView(object)).to.eql(expectedOutput);
        });
    });

    describe('aliases', () => {

        it('should join all alias names comma separated and capitalized', () => {

            const object = {aliases: [{firstName: 'one', lastName: 'two'}, {firstName: 'three', lastName: 'four'}]};
            const expectedOutput = {aliases: 'One Two, Three Four'};

            expect(formatObjectForView(object)).to.eql(expectedOutput);
        });

        it('should give empty if alias list missing', () => {

            const object = {aliases: undefined};
            const expectedOutput = {aliases: ''};

            expect(formatObjectForView(object)).to.eql(expectedOutput);
        });

        it('should give empty if aliases list empty', () => {

            const object = {aliases: []};
            const expectedOutput = {aliases: ''};

            expect(formatObjectForView(object)).to.eql(expectedOutput);
        });
    });
});
