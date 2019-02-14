module.exports = {
    standardAction: (task, href) => {
        if (task === 'DONE') {
            return {
                text: 'Change',
                type: 'link',
                href
            };
        }

        if (task === 'UNSTARTED') {
            return {
                text: 'Start now',
                type: 'btn',
                href
            };
        }

        return {
            text: 'Continue',
            type: 'btn',
            href
        };
    },

    viewEdit: href => {
        return {
            text: 'View/Edit',
            type: 'btn-secondary',
            href
        };
    },

    change: href => {
        return {
            text: 'Change',
            type: 'link',
            href
        };
    },

    continueBtn: href => {
        return {
            text: 'Continue',
            type: 'btn',
            href
        };
    }
};
