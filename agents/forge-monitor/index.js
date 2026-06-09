const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const app = express()
app.use(bodyParser.json())

function verifySignature(req) {
  // TODO: implement using process.env.GITHUB_WEBHOOK_SECRET
  return true
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), agents: {} })
})

app.post('/webhook/github', (req, res) => {
  if (!verifySignature(req)) return res.status(401).send('bad sig')
  // parse push, PR events -> schedule push-report job
  res.send({ ok: true })
})

app.post('/push/agent/:agentId', (req, res) => {
  // forward payload to agent (signed)
  res.send({ ok: true })
})

const port = process.env.FORGE_MONITOR_PORT || 8080
app.listen(port, ()=> console.log('forge-monitor running', port))
