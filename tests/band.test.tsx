import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'limit-band',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 120,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
} as const

test('die Leiste zeigt Kontext, 5-Std-Limit und Wochenlimit', async ($, on) => {
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('session.usage', () => ({
    value: { startedAt: 0, context: { window: 1000000 }, rateLimits: [] },
  }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.session.measure({
    context: { window: 1000000, tokens: 90000, percent: 9 },
    rateLimits: [
      { kind: 'five_hour', percentUsed: 9, resetsAt: '2026-10-30T15:10:00Z' },
      { kind: 'seven_day', percentUsed: 19, resetsAt: '2026-11-05T03:00:00Z' },
    ],
    changed: ['context', 'rateLimits'],
  })

  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /5-Std-Limit/ })) !== undefined).toBe(true)
  expect((await ui.find({ type: 'Text', text: /Reset 16:10 Uhr/ })) !== undefined).toBe(true)
  expect((await ui.find({ type: 'Text', text: /Reset Do 04:00/ })) !== undefined).toBe(true)
  expect((await ui.find({ type: 'Text', text: /19 %/ })) !== undefined).toBe(true)
  await ui.unmount()
})
