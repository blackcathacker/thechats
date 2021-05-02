const net = require('net')

const PORT = 1337
const IPADDR = '127.0.0.1'

const CLIENTS = {}

const server = net.createServer(onConnection).on('error', err => {
    throw err
}).listen(PORT, IPADDR, () => {
    console.log('opened server on', server.address())
})

function onConnection(sock) {
    const remoteAddress = sock.remoteAddress + ':' + sock.remotePort
    console.log('new connection from', remoteAddress)

    CLIENTS[remoteAddress] = { sock, name: remoteAddress, remoteAddress, onData,  }
    sock.write(intro())
    sock.on('data', clientHandler(remoteAddress, sock))
    sock.on('error', err => {
        console.error(`Error from ${remoteAddress}`, err)
    })
}

function emitToServer(client, message) {
    const fullMessage = `${new Date().toLocaleString()} [${client.name}] : ${message}\n`
    Object.values(CLIENTS).filter(c => c.remoteAddress !== client.remoteAddress).forEach(c => c.sock.write(fullMessage))
}

const COMMAND_REGEX = /^:(a-zA-Z) (.*)/
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
        client.sock.write(`Unknown command received - ${command}`)
    }
}

function clientHandler(remoteAddress, sock) {
    return data => {
        const client = CLIENTS[remoteAddress]
        console.log(`${remoteAddress} says ${data}`)
        const command = COMMAND_REGEX.exec(data)
        if (command) {
            const handler = handlers[command[1]]
            if (handler) {
                handler(client, command[2], data)
            } else {
                handlers.unknown(client, data, command[1])
            }
        } else {
            handlers.default(client, data)
        }
    }
}

function intro(remoteAddr) {
    return `Welcome to THE CHATS server ${remoteAddr}.
Available commands:
    :name <Your name>
        Sets the name that will be displayed when you send messages.
    <Message>
        Send a message
`
}