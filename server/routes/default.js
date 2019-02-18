const express = require('express')
const config = require('../config')

module.exports = () => {
    const router = express.Router()

    router.get('/', (req, res) => {
        if (req.user && config.roles.admin.includes(req.user.role)) {
            return res.redirect('/admin/')
        }
        res.redirect('/caseList/active')
    })

    return router
}
