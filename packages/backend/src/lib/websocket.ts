/* eslint-disable @typescript-eslint/no-unsafe-call */
import express from 'express'
import http from 'http'
import WebSocket from 'ws'

const port = 4100
const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

export { port, server, wss }
