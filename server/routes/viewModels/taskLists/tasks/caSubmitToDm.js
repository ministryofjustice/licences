const caSubmitApproval = require('./caSubmitApproval')
const caSubmitRefusal = require('./caSubmitRefusal')

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
