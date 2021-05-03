const fs = require('fs')
const readline = require('readline')
const { createLogMessage } = require('./util')

// Simple POC "persistent" store leveraging the already existing logging functionality
// In a real implementation I imagine this would be a real data store of some type (SQL, NoSQL)
// that would provide actual inserts, indexes, queries, etc.
function createStore({ logFile } = {}) {
    const store = []
    if (logFile) {
        try {
            fs.access(logFile, fs.constants.R_OK, err => {
                if (err) {
                    console.log(`${logFile} does not exist or is not accessible. History will not be available.`)
                    return
                }
                const readInterface = readline.createInterface({
                    input: fs.createReadStream(logFile),
                    console: false
                });
                readInterface.on('error', () => { })
                readInterface.on('line', l => {
                    try {
                        store.push(JSON.parse(l))
                    } catch (err) {
                        console.error('Unable to process line from log file', err)
                    }
                })
            })
        } catch (err) {
            console.warn('Unable to read from log file', logFile, err)
        }
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