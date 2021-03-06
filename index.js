const net = require('net')
const { createServer } = require('./server')
const { createLogger } = require('./server/file-logger')
const { createTelnetServer } = require('./server/telnet')
const { createRestApiServer } = require('./server/api')
const { createStore } = require('./server/store')
const config = require('./config.json')

const logger = config.serverLogFile && createLogger(config.serverLogFile)
const chatServer = createServer({ logger, store: createStore({ logFile: config.serverLogFile }) })

const telnetServer = createTelnetServer(config.telnetPort, config.ipAddress, chatServer)
const apiServer = createRestApiServer(chatServer).listen(config.httpPort)
