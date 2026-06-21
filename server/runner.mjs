// Core agent workflow: validate → reserve credits → run model → store → settle/refund.
import { db, getAgent } from './db.mjs'
import { reserve, refund } from './credits.mjs'
import { runProvider } from './providers.mjs'

export async function runAgent({ orgId = 'demo', agentId, inputs = {}, baseUrl }) {
  const agent = getAgent(agentId)
  if (!agent) {
    const e = new Error('agent_not_found'); e.code = 'agent_not_found'; throw e
  }

  const genId = crypto.randomUUID()
  const now = new Date().toISOString()
  db.prepare(`INSERT INTO generations (id,org_id,agent_id,status,inputs,credits,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?)`).run(
    genId, orgId, agentId, 'queued', JSON.stringify(inputs), agent.credit_cost, now, now,
  )

  // reserve credits up front (throws insufficient_credits)
  reserve(orgId, genId, agent.credit_cost)
  setStatus(genId, 'processing')

  try {
    const output = await runProvider(agent, inputs, genId, baseUrl)
    db.prepare('UPDATE generations SET status=?, output=?, updated_at=? WHERE id=?')
      .run('done', JSON.stringify(output), new Date().toISOString(), genId)
    return getGeneration(genId)
  } catch (err) {
    // refund on failure → user never loses credits for a failed run
    refund(orgId, genId, agent.credit_cost)
    db.prepare('UPDATE generations SET status=?, error=?, updated_at=? WHERE id=?')
      .run('error', String(err.message || err), new Date().toISOString(), genId)
    const out = getGeneration(genId)
    out._error = String(err.message || err)
    return out
  }
}

function setStatus(id, status) {
  db.prepare('UPDATE generations SET status=?, updated_at=? WHERE id=?').run(status, new Date().toISOString(), id)
}
export function getGeneration(id) {
  const g = db.prepare('SELECT * FROM generations WHERE id=?').get(id)
  if (g) { g.inputs = safe(g.inputs); g.output = safe(g.output) }
  return g
}
export function listGenerations(orgId = 'demo', limit = 50) {
  return db.prepare('SELECT * FROM generations WHERE org_id=? ORDER BY created_at DESC LIMIT ?')
    .all(orgId, limit).map(g => ({ ...g, inputs: safe(g.inputs), output: safe(g.output) }))
}
function safe(s) { try { return JSON.parse(s) } catch { return s } }
