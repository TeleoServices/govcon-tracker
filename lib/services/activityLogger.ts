import { prisma } from '@/lib/prisma'

interface ActivityLog {
  organizationId: string
  entityType: string
  entityId: string
  activityType: string
  description: string
  userId?: string
  opportunityId?: string
  contractId?: string
  subcontractorId?: string
  metadata?: Record<string, any>
}

export class ActivityLogger {
  static async log(data: ActivityLog) {
    try {
      const activity = await prisma.activity.create({
        data: {
          organizationId: data.organizationId,
          entityType: data.entityType,
          entityId: data.entityId,
          activityType: data.activityType,
          description: data.description,
          userId: data.userId,
          opportunityId: data.opportunityId,
          contractId: data.contractId,
          subcontractorId: data.subcontractorId,
          metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        },
      })

      return activity
    } catch (error) {
      console.error('Activity logging error:', error)
      // Don't throw - logging should not break the main operation
      return null
    }
  }

  // Convenience methods for common activities
  static async logOpportunityCreated(
    organizationId: string,
    opportunityId: string,
    title: string,
    userId?: string
  ) {
    return this.log({
      organizationId,
      entityType: 'Opportunity',
      entityId: opportunityId,
      activityType: 'Created',
      description: `Opportunity created: ${title}`,
      userId,
      opportunityId,
    })
  }

  static async logOpportunityUpdated(
    organizationId: string,
    opportunityId: string,
    title: string,
    changes: Record<string, any>,
    userId?: string
  ) {
    const changeDescriptions = Object.entries(changes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')

    return this.log({
      organizationId,
      entityType: 'Opportunity',
      entityId: opportunityId,
      activityType: 'Updated',
      description: `Opportunity updated: ${title} - ${changeDescriptions}`,
      userId,
      opportunityId,
      metadata: changes,
    })
  }

  static async logOpportunityStageChange(
    organizationId: string,
    opportunityId: string,
    title: string,
    oldStage: string,
    newStage: string,
    userId?: string
  ) {
    return this.log({
      organizationId,
      entityType: 'Opportunity',
      entityId: opportunityId,
      activityType: 'Stage Change',
      description: `Opportunity "${title}" moved from ${oldStage} to ${newStage}`,
      userId,
      opportunityId,
      metadata: { oldStage, newStage },
    })
  }

  static async logContractCreated(
    organizationId: string,
    contractId: string,
    contractNumber: string,
    title: string,
    userId?: string
  ) {
    return this.log({
      organizationId,
      entityType: 'Contract',
      entityId: contractId,
      activityType: 'Created',
      description: `Contract created: ${contractNumber} - ${title}`,
      userId,
      contractId,
    })
  }

  static async logContractModification(
    organizationId: string,
    contractId: string,
    contractNumber: string,
    modificationNumber: string,
    valueChange: number,
    userId?: string
  ) {
    return this.log({
      organizationId,
      entityType: 'Contract',
      entityId: contractId,
      activityType: 'Modified',
      description: `Contract ${contractNumber} modified (${modificationNumber}): ${valueChange >= 0 ? '+' : ''}$${valueChange.toLocaleString()}`,
      userId,
      contractId,
      metadata: { modificationNumber, valueChange },
    })
  }

  static async logSubcontractorCreated(
    organizationId: string,
    subcontractorId: string,
    companyName: string,
    userId?: string
  ) {
    return this.log({
      organizationId,
      entityType: 'Subcontractor',
      entityId: subcontractorId,
      activityType: 'Created',
      description: `Subcontractor added: ${companyName}`,
      userId,
      subcontractorId,
    })
  }

  static async logQuoteReceived(
    organizationId: string,
    quoteId: string,
    subcontractorName: string,
    amount: number,
    opportunityId?: string,
    userId?: string
  ) {
    return this.log({
      organizationId,
      entityType: 'Quote',
      entityId: quoteId,
      activityType: 'Created',
      description: `Quote received from ${subcontractorName}: $${amount.toLocaleString()}`,
      userId,
      opportunityId,
      metadata: { amount, subcontractorName },
    })
  }

  static async logQuoteStatusChange(
    organizationId: string,
    quoteId: string,
    subcontractorName: string,
    oldStatus: string,
    newStatus: string,
    opportunityId?: string,
    userId?: string
  ) {
    return this.log({
      organizationId,
      entityType: 'Quote',
      entityId: quoteId,
      activityType: 'Status Change',
      description: `Quote from ${subcontractorName} changed from ${oldStatus} to ${newStatus}`,
      userId,
      opportunityId,
      metadata: { oldStatus, newStatus, subcontractorName },
    })
  }

  static async logTeamMemberAssigned(
    organizationId: string,
    opportunityId: string,
    opportunityTitle: string,
    userName: string,
    role: string,
    userId?: string
  ) {
    return this.log({
      organizationId,
      entityType: 'TeamMember',
      entityId: opportunityId,
      activityType: 'Assigned',
      description: `${userName} assigned to "${opportunityTitle}" as ${role}`,
      userId,
      opportunityId,
      metadata: { userName, role },
    })
  }

  static async logTeamMemberRemoved(
    organizationId: string,
    opportunityId: string,
    opportunityTitle: string,
    userName: string,
    userId?: string
  ) {
    return this.log({
      organizationId,
      entityType: 'TeamMember',
      entityId: opportunityId,
      activityType: 'Removed',
      description: `${userName} removed from "${opportunityTitle}"`,
      userId,
      opportunityId,
      metadata: { userName },
    })
  }

  static async logDocumentUploaded(
    organizationId: string,
    documentId: string,
    documentName: string,
    entityType: string,
    entityId: string,
    userId?: string
  ) {
    return this.log({
      organizationId,
      entityType: 'Document',
      entityId: documentId,
      activityType: 'Uploaded',
      description: `Document uploaded: ${documentName}`,
      userId,
      metadata: { documentName, relatedEntityType: entityType, relatedEntityId: entityId },
    })
  }

  static async logComplianceRequirementCompleted(
    organizationId: string,
    requirementId: string,
    description: string,
    opportunityId: string,
    userId?: string
  ) {
    return this.log({
      organizationId,
      entityType: 'ComplianceRequirement',
      entityId: requirementId,
      activityType: 'Completed',
      description: `Compliance requirement completed: ${description}`,
      userId,
      opportunityId,
    })
  }
}

// Export singleton instance
export const activityLogger = ActivityLogger
