// Credit ledger — reserve on enqueue, settle on success, refund on failure.
import { db, getOrg } from './db.mjs'

function ledger(orgId, generationId, delta, reason) {
  db.prepare(
    'INSERT INTO credit_ledger (id, org_id, generation_id, delta, reason, created_at) VALUES (?,?,?,?,?,?)',
  ).run(crypto.randomUUID(), orgId, generationId, delta, reason, new Date().toISOString())
  db.prepare('UPDATE orgs SET credits = credits + ? WHERE id = ?').run(delta, orgId)
}

export function reserve(orgId, generationId, cost) {
  const org = getOrg(orgId)
  if (!org) throw new Error('org_not_found')
  if (org.credits < cost) {
    const err = new Error('insufficient_credits')
    err.code = 'insufficient_credits'
    err.balance = org.credits
    throw err
  }
  ledger(orgId, generationId, -cost, 'reserve')
}

export function refund(orgId, generationId, cost) {
  ledger(orgId, generationId, +cost, 'refund')
}

export function balance(orgId) {
  return getOrg(orgId)?.credits ?? 0
}
