module.exports = {
  standardAction: (task, href, dataQa) => {
    if (task === 'DONE') {
      return {
        text: 'Change',
        type: 'link',
        href,
        dataQa,
      }
    }

    if (task === 'UNSTARTED') {
      return {
        text: 'Start now',
        type: 'btn',
        href,
      }
    }

    return {
      text: 'Continue',
      type: 'btn',
      href,
    }
  },

  standardActionMulti: (tasksArray, href) => {
    if (tasksArray.every((task) => task === 'UNSTARTED')) {
      return {
        text: 'Start now',
        type: 'btn',
        href,
      }
    }

    if (tasksArray.every((task) => task === 'DONE')) {
      return {
        text: 'Change',
        type: 'link',
        href,
      }
    }

    return {
      text: 'Continue',
      type: 'btn',
      href,
    }
  },

  viewEdit: (href, dataQa) => {
    return {
      text: 'View/Edit',
      type: 'btn-secondary',
      href,
      dataQa,
    }
  },

  view: (href) => {
    return {
      text: 'View',
      type: 'btn-secondary',
      href,
    }
  },

  change: (href, dataQa) => {
    return {
      text: 'Change',
      type: 'link',
      href,
      dataQa,
    }
  },

  continueBtn: (href, dataQa) => {
    return {
      text: 'Continue',
      type: 'btn',
      href,
      dataQa,
    }
  },

  taskBtn: (href, text, secondary, dataQa) => {
    return {
      text,
      type: secondary ? 'btn-secondary' : 'btn',
      href,
      dataQa,
    }
  },
}
