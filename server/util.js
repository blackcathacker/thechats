
function createLogMessage(client, message) {
    return {
        clientId: client.id,
        clientName: client.name,
        timestamp: Date.now(),
        message: message
    }
}

module.exports = { createLogMessage }