document.addEventListener('DOMContentLoaded', () => {
    const previewInput = document.getElementById('js-preview-btn')
    const migrateInput = document.getElementById('js-migrate-btn')
    if (!previewInput && !migrateInput) return

    if (previewInput) {
        previewInput.addEventListener('click', e => {
            const licenceId = document.getElementById('previewLicenceId')?.value.trim()
            e.preventDefault()
            window.location.href ='/admin/migrateToCvl/licence/' + licenceId + '/preview'
        })
    }

    if (migrateInput) {
        migrateInput.addEventListener('click', e => {
            const bookingId = document.getElementById('migrateBookingId')?.value.trim()
            e.preventDefault()
            window.location.href ='/admin/migrateToCvl/licence/' + bookingId + '/migrate'
        })
    }
})
