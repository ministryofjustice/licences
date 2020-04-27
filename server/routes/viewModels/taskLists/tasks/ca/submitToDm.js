const caSubmitApproval = require('./submitApproval')
const caSubmitRefusal = require('./submitRefusal')

const title = 'Submit to decision maker'

module.exports = {
  approval: ({ decisions, allowedTransition }) => ({
    title,
    label: caSubmitApproval.getLabel({ decisions, allowedTransition }),
    action: caSubmitApproval.getCaAction({ allowedTransition }),
  }),

  refusal: ({ decisions }) => ({
    title,
    label: caSubmitRefusal.getLabel({ decisions }),
    action: caSubmitRefusal.getCaAction({ decisions }),
  }),
}
