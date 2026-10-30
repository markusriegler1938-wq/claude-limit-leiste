import { expect, test } from 'claude-code/testing'

const band = (bodyColumns: number) => ({
  plugin: 'limit-band',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
}) as const

test('die Leiste zeigt 5-Std-Limit und Wochenlimit, ohne Kontext', async ($, on) => {
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('session.usage', () => ({
    value: { startedAt: 0, context: { window: 1000000 }, rateLimits: [] },
  }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.session.measure({
    context: { window: 1000000, tokens: 120000, percent: 12 },
    rateLimits: [
      { kind: 'five_hour', percentUsed: 14, resetsAt: '2026-10-30T21:30:00Z' },
      { kind: 'seven_day', percentUsed: 9, resetsAt: '2026-11-01T05:00:00Z' },
    ],
    changed: ['context', 'rateLimits'],
  })

  for (const columns of [50, 120]) {
    const ui = await $.ui.mount({ ...band(columns), surface: 'desktop' })
    const five = await ui.find({ type: 'Text', text: /5-Std-Limit.*14 %.*Reset 22:30 Uhr/ })
    const week = await ui.find({ type: 'Text', text: /Wochenlimit.*9 %.*Reset So 06:00/ })
    expect(five !== undefined).toBe(true)
    expect(week !== undefined).toBe(true)
    expect((await ui.find({ type: 'Text', text: /Kontext/ })) === undefined).toBe(true)
    await ui.unmount()
  }
})
