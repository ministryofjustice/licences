const createNotificationService = require('../../server/services/notificationService');
const templates = require('../../server/services/config/notificationTemplates');

describe('notificationService', () => {
    let service;
    let notifyClient;

    beforeEach(() => {
        notifyClient = {
            sendEmail: sinon.stub().resolves({})
        };
        service = createNotificationService(notifyClient);
    });

    describe('notifyRoOfNewCase', () => {
        it('should call sendEmail from notifyClient', async () => {
            await service.notifyRoOfNewCase('Matthew Whitfield');
            expect(notifyClient.sendEmail).to.be.calledOnce();
        });

        it('should pass in the template id', async () => {
            await service.notifyRoOfNewCase('Matthew Whitfield');
            expect(notifyClient.sendEmail).to.be.calledWith(
                templates.sentToRo.templateId,
                sinon.match.any,
                sinon.match.any,
            );
        });

        // TODO update with real email address
        it('should pass in the email address', async () => {
            await service.notifyRoOfNewCase('Matthew Whitfield');
            expect(notifyClient.sendEmail).to.be.calledWith(
                sinon.match.any,
                'some-email@someone.com',
                sinon.match.any
            );
        });

        it('should pass in the required variables', async () => {
            let clock = sinon.useFakeTimers(new Date('May 31, 2018 12:00:00').getTime());
            await service.notifyRoOfNewCase('Matthew Whitfield');
            expect(notifyClient.sendEmail).to.be.calledWith(
                sinon.match.any,
                sinon.match.any,
                {
                    personalisation: {
                        name: 'Matthew Whitfield',
                        date: '31st May 2018',
                        domain: 'http://localhost:3000'
                    }
                }
            );
            clock.restore();

        });
    });
});
