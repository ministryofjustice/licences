document.addEventListener('DOMContentLoaded', () => {
const wrapper = document.getElementById('js-back-button-wrapper')
if (!wrapper) return

const link = document.createElement('a')
link.textContent = 'Back'
link.id = 'backBtn'
link.classList.add('requiredButton', 'button', 'button-secondary')
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
