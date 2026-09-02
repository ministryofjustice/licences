document.addEventListener('DOMContentLoaded', () => {
const wrapper = document.getElementById('js-back-wrapper')
if (!wrapper) return

const link = document.createElement('a')
link.textContent = 'Back'
link.id = 'backLink'
link.className = 'link-back'
link.href = '/' // fallback if no history

link.addEventListener('click', e => {
    if (window.history.length > 1) {
    e.preventDefault()
    window.history.back()
    }
})

wrapper.appendChild(link)
})
