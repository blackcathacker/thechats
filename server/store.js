const fs = require('fs')
const readline = require('readline')
const { createLogMessage } = require('./util')

function createStore({ logFile } = {}) {
    const store = []
    if (logFile) {
        const readInterface = readline.createInterface({
            input: fs.createReadStream(logFile),
            console: false
        });
        readInterface.on('line', l => {
            try {
                store.push(JSON.parse(l))
            } catch (err) {
                console.error('Unable to process line from log file', err)
            }
        })
    }
    return {
        put: (client, message) => {
            store.push(createLogMessage(client, message))
        },
        get: ({ q = '' } = {}) => {
            return store.filter(m => m.message.match(new RegExp(`.*${q}.*`, 'i')))
        }
    }
}

module.exports = { createStore }