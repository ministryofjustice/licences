import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { AuditEvent, AuditService as HmppsAuditService, SubjectType } from '@ministryofjustice/hmpps-audit-client'
import { Request } from 'express'
import logger from '../../../log'
import getAuditPolicy, { AuditPolicy } from './routeAuditPolicy'
import config from '../../config'
import { RoUser } from '../../data/userClient'

export default class AuditService {
  constructor(private readonly hmppsAuditService: HmppsAuditService) {
  }

  async logPageViewAttempt(
    requestId: string,
    prisoner: any,
    policy: AuditPolicy,
    user: any,
  ): Promise<void> {
    const eventType = `${policy.eventType}_ATTEMPT`
    const auditEvent = this.createAuditEvent(eventType, prisoner, requestId, user)
    await this.sendAuditEvent(auditEvent)
  }

  async logPageViewSuccess(
    requestId: string,
    prisoner: any,
    policy: AuditPolicy,
    user: any,
  ): Promise<void> {
    const eventType = `${policy.eventType}_SUCCESS`
    const auditEventMessage = this.createAuditEvent(eventType, prisoner, requestId, user)
    await this.sendAuditEvent(auditEventMessage)
  }

  async logPageAccessFailure(req: Request, prisoner: any, failureReason: string, user: any): Promise<void> {
    const path = `${req.method} ${req.baseUrl}${req.path}`
    const routePolicy = getAuditPolicy(path)
    if (!routePolicy?.policy) {
      logger.error(`No audit policy found for route: ${path}`)
      return
    }

    const eventType = `${routePolicy.policy.eventType}_FAILURE`
    const baseAuditEventMessage = this.createAuditEvent(eventType, prisoner, req.id, user)
    const auditEventMessage = {
      ...baseAuditEventMessage,
      details: {
        ...baseAuditEventMessage.details,
        failureReason,
      }
    }
    await this.sendAuditEvent(auditEventMessage)
  }

  async logCaseListView(
    requestId: string,
    caseList: any,
    user: any,
  ): Promise<void> {

    const baseAuditEventMessage = this.createAuditEvent('VIEW_CASE_LIST_SUCCESS', null, requestId, user)
    const auditEventMessage = {
      ...baseAuditEventMessage,
      details: {
        ...baseAuditEventMessage.details,
        results: {
          resultCount: caseList.length,
          returnedSubjectIds: caseList.map((c: any) => c.offenderNo),
        },
      }
    }

    await this.sendAuditEvent(auditEventMessage)
  }

  async logComUsersSearchEvent(requestId: string, searchTerm: string, comUsers: Array<RoUser>, user: any): Promise<void> {
    const baseAuditEventMessage = this.createAuditEvent('SEARCH_COM_USERS_SUCCESS', null, requestId, user)
    const auditEventMessage = {
      ...baseAuditEventMessage,
      subjectType: 'SEARCH_TERM' as SubjectType,
      subjectId: searchTerm,
      details: {
        ...baseAuditEventMessage.details,
        results: {
          resultCount: comUsers.length,
          returnedSubjectIds: comUsers.map((c: RoUser) => c.deliusId),
        },
      }
    }

    await this.sendAuditEvent(auditEventMessage)
  }

  private async sendAuditEvent(auditEvent: AuditEvent): Promise<void> {
    if (config.sqs.audit.enabled) {
      logger.info(`sending audit event type: ${auditEvent.what}`)
      telemetry.setSpanAttributes({audited: true})

      try {
        await this.hmppsAuditService.logAuditEvent(auditEvent)
      } catch (error) {
        logger.error('Could not send audit event to hmpps audit service', error)
      }
    }
  }

  private createAuditEvent(eventType: string, prisoner: any, requestId: string, user: any): AuditEvent {
    const {subjectType, subjectId} = this.getSubjectFromRequest(prisoner)
    return {
      what: eventType,
      subjectType,
      subjectId,
      correlationId: requestId,
      who: user.username,
      details: {
        build: config.gitRef,
        userRoles: user.roles,
      },
    }
  }

  private getSubjectFromRequest(prisoner: any): { subjectType: SubjectType; subjectId: string } {
    if (prisoner?.offenderNo) {
      return {
        subjectType: 'PRISONER_ID',
        subjectId: prisoner.offenderNo,
      }
    }

    return {
      subjectType: 'NOT_APPLICABLE',
      subjectId: '',
    }
  }
}
