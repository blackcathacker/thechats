const COMMAND_REGEX = /^:([a-zA-Z]+)\s*(.*)/

function intro(id) {
    return `Welcome to THE CHATS server ${id}.
Available commands:
    :name <Your name>
        Sets the name that will be displayed when you send messages.
    :createRoom <New Room Name>
        Creates new chatroom
    :listRooms
        Show list of all rooms that currently exist
    :gotoRoom <Room Name>
        Switch current chatroom
    :who
        List users in the current chatroom
    <Message>
        Send a message
`
}

function createServer({ logger = () => { }, store } = {}) {
    const CLIENTS = {}
    const ROOMS = ['default']
    function emitToServer(client, message) {
        const fullMessage = `${new Date().toLocaleString()} [${client.name}] : ${message}\n`
        Object.values(CLIENTS)
            .filter(c => c.id !== client.id)
            .filter(c => c.room === client.room)
            .forEach(c => c.writeTo(fullMessage))
    }
    
    const handlers = {
        name: (client, commandArgs) => {
            const renameMessage = `${client.name} has renamed themselves to ${commandArgs}`
            client.name = commandArgs
            emitToServer(client, renameMessage)
        },
        createRoom: (client, commandArgs) => {
            if (ROOMS.includes(commandArgs)) {
                client.writeTo('Error - Room already exists\n')
            }
            ROOMS.push(commandArgs)
            client.room = commandArgs
            client.writeTo(`Now in room ${commandArgs}\n`)
        },
        listRooms: (client) => {
            client.writeTo(`List of currently available chat rooms\n - ${ROOMS.map(r => r === client.room ? `${r} *` : r).join('\n - ')}\n`)
        },
        gotoRoom: (client, commandArgs) => {
            if (!ROOMS.includes(commandArgs)) {
                client.writeTo(`Error - ${commandArgs} does not currently exist. To create it use ':createRoom'\n`)
            }
            client.room = commandArgs
            client.writeTo(`You are now in ${commandArgs}\n`)
        },
        who: (client) => {
            const users = Object.values(CLIENTS)
                .filter(c => c.room === client.room)
                .map(c => c.id === client.id ? `${c.name} *`: c.name)
                .join('\n - ')
            client.writeTo(`Users in ${client.room}\n - ${users}\n`)
        },
        quit: (client) => {
            if (client.disconnect) {
                client.writeTo('See ya next time!')
                client.disconnect()
            }
            delete CLIENTS[client.id]
        },
        default: (client, data) => {
            emitToServer(client, data)
        },
        unknown: (client, data, command) => {
            client.writeTo(`Unknown command received - ${command}\n`)
        }
    }
    function handleMessage(client, message) {
        logger(client, message)
        if (store) {
            store.put(client, message)
        }
    }
    return {
        addClient: (id, { name = id, writeTo = () => { } } = {}) => {
            const client = {
                id,
                name,
                room: 'default',
                writeTo
            }
            CLIENTS[id] = client
            handleMessage(client, 'connected')
            writeTo(intro(id))
            emitToServer(client, 'connected')
        },
        processClientInput: (id, message) => {
            const client = CLIENTS[id]
            if (!message || !client) return
            handleMessage(client, message)
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
        postMessage: (id, name, room, message) => {
            handleMessage({ id, name, room }, message)
            emitToServer({ name, room }, message)
        },
        getMessages: ({ q } = {}) => {
            return store.get({ q })
        },
        clientDisconnect: (id) => {
            delete CLIENTS[id]
        }
    }
}

module.exports = { createServer }