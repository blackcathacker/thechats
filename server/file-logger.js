const fs = require('fs')
const { createLogMessage } = require('./util')

function createLogger(file) {
    return (client, message) => {
        const log = createLogMessage(client, message)
        fs.appendFile(file, `${JSON.stringify(log)}\n`, err => {
            if (err) {
                console.error(`Error logging messages to ${file}`, err)
            }
        })
    }
}

module.exports = { createLogger }