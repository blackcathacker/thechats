const COMMAND_REGEX = /^:([a-zA-Z]+)\s*(.*)/

function intro(id) {
    return `Welcome to THE CHATS server ${id}.
Available commands:
    :name <Your name>
        Sets the name that will be displayed when you send messages.
    <Message>
        Send a message
`
}

function createServer({ logger = () => { } } = {}) {
    const CLIENTS = {}
    function emitToServer(client, message) {
        const fullMessage = `${new Date().toLocaleString()} [${client.name}] : ${message}\n`
        Object.values(CLIENTS).filter(c => c.id !== client.id).forEach(c => c.writeTo(fullMessage))
    }
    
    const handlers = {
        name: (client, commandArgs) => {
            const renameMessage = `${client.name} has renamed themselves to ${commandArgs}`
            client.name = commandArgs
            emitToServer(client, renameMessage)
        },
        default: (client, data) => {
            emitToServer(client, data)
        },
        unknown: (client, data, command) => {
            client.writeTo(`Unknown command received - ${command}`)
        }
    }
    return {
        addClient: (id, { name = id, writeTo = () => { } } = {}) => {
            const client = {
                id,
                name,
                writeTo
            }
            CLIENTS[id] = client
            logger(client, 'connected')
            writeTo(intro(id))
            emitToServer(client, 'connected')
        },
        processClientInput: (id, message) => {
            const client = CLIENTS[id]
            logger(client, message)
            if (!client) {
                throw new Error('Client must be registered')
            }
            const command = COMMAND_REGEX.exec(message)
            if (command) {
                const handler = handlers[command[1]]
                if (handler) {
                    handler(client, command[2], message)
                } else {
                    handlers.unknown(client, message, command[1])
                }
            } else {
                handlers.default(client, message)
            }
        },
        postMessage: (id, name, message) => {
            logger({ id, name }, message)
            emitToServer({ name }, message)
        }
    }
}

module.exports = { createServer }