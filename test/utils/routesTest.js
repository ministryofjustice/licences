const {getPathFor} = require('../../server/utils/routes');

describe('getPathFor', () => {
    context('when the nextPath is a string', () => {
        it('returns the nextPath', () => {
            const data = {decision: 'yes'};
            const config = {nextPath: {path: '/foo'}};
            const path = getPathFor({data, config});

            expect(path).to.equal('/foo');
        });
    });

    context('when the next path is an object with multiple exit points', () => {
        it('returns the correct nextPath for Yes', () => {
            const data = {fooAnswer: 'Yes'};
            const config = {
                nextPath: {
                    decisions: {
                        discriminator: 'fooAnswer',
                        Yes: '/baz',
                        No: '/bar'
                    },
                    path: '/foo'
                }
            };
            const path = getPathFor({data, config});

            expect(path).to.equal('/baz');
        });
        it('returns the correct nextPath for No', () => {
            const data = {fooAnswer: 'No'};
            const config = {
                nextPath: {
                    decisions: {
                        discriminator: 'fooAnswer',
                        Yes: '/ram',
                        No: '/bar'
                    },
                    path: '/foo'
                }
            };
            const path = getPathFor({data, config});

            expect(path).to.equal('/bar');
        });
    });

    context('when the next path is an array with multiple exit points', () => {
       it('returns the nextPath of when there is a match', () => {
           const data = {
               fooAnswer: 'Yes',
               barAnswer: 'Yes',
               bazAnswer: 'No'
           };

           const config = {
               nextPath: {
                   decisions: [
                       {
                           discriminator: 'fooAnswer',
                           No: '/bar'
                       },
                       {
                           discriminator: 'barAnswer',
                           No: '/baz'
                       },
                       {
                           discriminator: 'bazAnswer',
                           No: '/bat'
                       }
                   ],
                   path: '/foo'
               }
           };
           const path = getPathFor({data, config});

           expect(path).to.equal('/bat');
       });

        it('returns the default path when there is no match', () => {
            const data = {
                fooAnswer: 'Yes',
                barAnswer: 'Yes',
                bazAnswer: 'Yes'
            };

            const config = {
                nextPath: {
                    decisions: [
                        {
                            discriminator: 'fooAnswer',
                            No: '/bar'
                        },
                        {
                            discriminator: 'barAnswer',
                            No: '/baz'
                        },
                        {
                            discriminator: 'bazAnswer',
                            No: '/foo'
                        }
                    ],
                    path: '/bat'
                }
            };

            const path = getPathFor({data, config});

            expect(path).to.equal('/bat');
        });
    });
});
