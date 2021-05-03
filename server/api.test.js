const { createRestApiServer } = require('./api')
const { createServer } = require('./index')
const _axios = require('axios')
const httpAdapter = require('axios/lib/adapters/http')
const http = require('http')

describe('api server', () => {
    let axios, apiServer
    const telnetClientWrite = jest.fn()
    const logger = jest.fn()
    beforeEach(() => {
        jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01').getTime());
        const chatServer = createServer({logger})
        apiServer = http.createServer(createRestApiServer(chatServer)).listen(0)
        axios = _axios.create({
            baseURL: `http://127.0.0.1:${apiServer.address().port}`,
            adapter: httpAdapter
        })
        chatServer.addClient('telnetClient', { writeTo: telnetClientWrite })
        telnetClientWrite.mockClear()
        logger.mockClear()
    })
    afterEach(() => {
        jest.runAllTimers()
        jest.useRealTimers()
        apiServer.close()
    })
    it('posts messages from api endpoint', async () => {
        const resp = await axios.post('/', { name: 'ApiUser', message: 'My rest api message' })
        expect(resp.status).toBe(200)
        expect(resp.data).toBe('Message sent')
        expect(telnetClientWrite).toHaveBeenCalledWith('1/1/2020, 12:00:00 AM [ApiUser] : My rest api message\n')
        expect(logger).toHaveBeenCalledWith({ id: expect.stringMatching(/http:\/\/.*127\.0\.0\.1/), name: 'ApiUser'}, 'My rest api message')
    })
})