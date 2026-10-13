document.addEventListener('DOMContentLoaded', () => {
    const createPdf = document.getElementById('createPdf')
    if (!createPdf) return

    if (createPdf) {
        createPdf.addEventListener('click', e => {
            setTimeout(() => {
                window.location.reload()
            }, 200)
        })
    }
})
