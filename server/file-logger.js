const fs = require('fs')

function createLogger(file) {
    return (client, message) => {
        const log = {
            clientId: client.id,
            clientName: client.name,
            timestamp: Date.now(),
            message
        }
        fs.appendFile(file, `${JSON.stringify(log)}\n`, err => {
            if (err) {
                console.error(`Error logging messages to ${file}`, err)
            }
        })
    }
}

module.exports = { createLogger }