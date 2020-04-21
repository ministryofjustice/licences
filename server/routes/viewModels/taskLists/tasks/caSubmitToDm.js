const caSubmitApproval = require('./caSubmitApproval')
const caSubmitRefusal = require('./caSubmitRefusal')

const title = 'Submit to decision maker'

module.exports = {
  approval: ({ decisions, allowedTransition, visible = true }) => ({
    title,
    label: caSubmitApproval.getLabel({ decisions, allowedTransition }),
    action: caSubmitApproval.getCaAction({ allowedTransition }),
    visible,
  }),

  refusal: ({ decisions, visible = true }) => ({
    title,
    label: caSubmitRefusal.getLabel({ decisions }),
    action: caSubmitRefusal.getCaAction({ decisions }),
    visible,
  }),
}
