document.addEventListener('DOMContentLoaded', () => {
const wrapper = document.getElementById('js-cancel-button-wrapper')
if (!wrapper) return

const link = document.createElement('a')
link.textContent = 'Cancel'
link.id = 'backBtn'
link.classList.add('requiredButton', 'button', 'button-secondary', 'smallMarginTop')
link.role = 'button'
link.href = '/' // fallback if no history

link.addEventListener('click', e => {
    if (window.history.length > 1) {
    e.preventDefault()
    window.history.back()
    }
})

wrapper.appendChild(link)
})
