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
            await service.pushStatus('1', {approval: 'Yes'}, 'token');
            expect(nomisClientMock.putApprovalStatus).to.be.calledOnce();
            expect(nomisClientMock.putApprovalStatus).to.be.calledWith('1', 'APPROVED', 'token');
        });

        it('should call nomisClient.putApprovalStatus with Rejected if approvalDecision is No', async () => {
            await service.pushStatus('1', {approval: 'No'}, 'token');
            expect(nomisClientMock.putApprovalStatus).to.be.calledOnce();
            expect(nomisClientMock.putApprovalStatus).to.be.calledWith('1', 'REJECTED', 'token');
        });

        it('should not nomisClient.putApprovalStatus if no decision', async () => {
            await service.pushStatus('1', {approval: undefined}, 'token');
            expect(nomisClientMock.putApprovalStatus).to.not.be.called();
        });

        it('should call nomisClient.putApprovalStatus if postpone investigation', async () => {
            await service.pushStatus('1', {postpone: 'Yes', postponeReason: 'investigation'}, 'token');
            expect(nomisClientMock.putApprovalStatus).to.be.calledOnce();
            expect(nomisClientMock.putApprovalStatus).to.be.calledWith('1', 'PP INVEST', 'token');
        });

        it('should call nomisClient.putApprovalStatus if postpone outstanding risk', async () => {
            await service.pushStatus('1', {postpone: 'Yes', postponeReason: 'outstandingRisk'}, 'token');
            expect(nomisClientMock.putApprovalStatus).to.be.calledOnce();
            expect(nomisClientMock.putApprovalStatus).to.be.calledWith('1', 'PP OUT RISK', 'token');
        });

        it('should not call nomisClient.putApprovalStatus if postpone No', async () => {
            await service.pushStatus('1', {postpone: 'No', postponeReason: 'outstandingRisk'}, 'token');
            expect(nomisClientMock.putApprovalStatus).to.not.be.calledOnce();
        });

        it('should not call nomisClient.putApprovalStatus if no recognised reason', async () => {
            await service.pushStatus('1', {postpone: 'Yes', postponeReason: ''}, 'token');
            expect(nomisClientMock.putApprovalStatus).to.not.be.calledOnce();
        });
    });
});
