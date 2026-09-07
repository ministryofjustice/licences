document.addEventListener('DOMContentLoaded', () => {
const wrapper = document.getElementById('js-back-button-wrapper')
if (!wrapper) return

const backLinkScript = document.getElementById('backButtonScript')
const link_text = backLinkScript?.getAttribute('data-link_text')
const link_class_list = backLinkScript?.getAttribute('data-link_class_list')?.split(',')

const link = document.createElement('a')
link.textContent = link_text || 'Back'
link.id = 'backBtn'
link_class_list?.forEach(cls => link.classList.add(cls))
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
