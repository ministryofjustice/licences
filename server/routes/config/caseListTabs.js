module.exports = {
    CA: [
        {
            id: 'ready', text: 'Check eligibility', licenceStages: ['UNSTARTED', 'ELIGIBILITY'],
            statusFilter: {ELIGIBILITY: ['Opted out', 'Eligible']}
        },
        {
            id: 'getAddress', text: 'Get address', licenceStages: ['ELIGIBILITY'],
            licenceStatus: ['Eligible', 'Getting address', 'Address rejected', 'Opted out']
        },
        {id: 'submittedRo', text: 'Responsible officer', licenceStages: ['PROCESSING_RO']},
        {id: 'reviewCase', text: 'Review case', licenceStages: ['PROCESSING_CA']},
        {id: 'submittedDm', text: 'Decision maker', licenceStages: ['APPROVAL']},
        {
            id: 'create',
            text: 'Create licence',
            licenceStages: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'],
            licenceStatus: ['Approved', 'Modified']
        }
    ],
    RO: [
        {id: 'ready', text: 'Ready to check', licenceStages: ['PROCESSING_RO'], licenceStatus: 'Ready to check'},
        {id: 'checking', text: 'Checking', licenceStages: ['PROCESSING_RO'], licenceStatus: 'Assessment ongoing'},
        {id: 'withPrison', text: 'With prison', licenceStages: ['PROCESSING_CA', 'APPROVAL']},
        {
            id: 'approved',
            text: 'Approved',
            licenceStages: ['DECIDED', 'MODIFIED', 'MODIFIED_APPROVAL'],
            licenceStatus: ['Approved', 'Modified']
        }
    ],
    DM: [
        {id: 'ready', text: 'Ready to approve', licenceStages: ['APPROVAL']},
        {
            id: 'postponed',
            text: 'Postponed',
            licenceStages: ['PROCESSING_CA'],
            licenceStatus: 'Postponed'
        },
        {id: 'approved', text: 'Approved', licenceStages: ['DECIDED'], licenceStatus: 'Approved'},
        {id: 'refused', text: 'Refused', licenceStages: ['DECIDED'], licenceStatus: 'Refused'}
    ]
};
