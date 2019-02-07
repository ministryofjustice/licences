const createNomisPushService = require('../../server/services/nomisPushService');

describe('nomisPushService', () => {
    let service;
    let nomisClientMock;

    beforeEach(() => {
        nomisClientMock = {
            putApprovalStatus: sinon.stub().resolves()
        };
        const nomisClientBuilder = sinon.stub().returns(nomisClientMock);
        service = createNomisPushService(nomisClientBuilder);
    });

    describe('pushStatus', () => {
        it('should call nomisClient.putApprovalStatus with bookingId, status and systemToken', async () => {
            await service.pushStatus('1', 'Yes', 'token');
            expect(nomisClientMock.putApprovalStatus).to.be.calledOnce();
            expect(nomisClientMock.putApprovalStatus).to.be.calledWith('1', 'Approved', 'token');
        });

        it('should call nomisClient.putApprovalStatus with Rejected if approvalDecision is No', async () => {
            await service.pushStatus('1', 'No', 'token');
            expect(nomisClientMock.putApprovalStatus).to.be.calledOnce();
            expect(nomisClientMock.putApprovalStatus).to.be.calledWith('1', 'Rejected', 'token');
        });

        it('should not nomisClient.putApprovalStatus if no decision', async () => {
            await service.pushStatus('1', undefined, 'token');
            expect(nomisClientMock.putApprovalStatus).to.not.be.called();
        });
    });
});
