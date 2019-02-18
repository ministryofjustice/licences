module.exports = {
    standardAction: (task, href) => {
        if (task === 'DONE') {
            return {
                text: 'Change',
                type: 'link',
                href,
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
        if (tasksArray.every(task => task === 'UNSTARTED')) {
            return {
                text: 'Start now',
                type: 'btn',
                href,
            }
        }

        if (tasksArray.every(task => task === 'DONE')) {
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

    viewEdit: href => {
        return {
            text: 'View/Edit',
            type: 'btn-secondary',
            href,
        }
    },

    change: href => {
        return {
            text: 'Change',
            type: 'link',
            href,
        }
    },

    continueBtn: href => {
        return {
            text: 'Continue',
            type: 'btn',
            href,
        }
    },

    taskBtn: (href, text, secondary) => {
        return {
            text,
            type: secondary ? 'btn-secondary' : 'btn',
            href,
        }
    },
}
