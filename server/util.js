
function createLogMessage(client, message) {
    return {
        clientId: client.id,
        clientName: client.name,
        room: client.room,
        timestamp: Date.now(),
        message: message
    }
}

module.exports = { createLogMessage }