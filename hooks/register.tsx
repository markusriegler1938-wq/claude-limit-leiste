import { atom, read, update } from 'claude-code'
import type { Register, SessionRateLimit } from 'claude-code'

import type { Limits, Meter } from '../types'

const limits = atom({ plugin: 'limit-band', key: 'limits' } as const, null)

const CELLS = 10
const TIME_ZONE = 'Europe/Berlin'
// Ab dieser Breite stehen beide Balken nebeneinander, sonst untereinander
const ONE_ROW_COLUMNS = 92

const toLimits = (rateLimits: SessionRateLimit[]): Limits => {
  const meter = (kind: string): Meter | undefined => {
    const w = rateLimits.find(r => r.kind === kind)
    return w && { percent: w.percentUsed, resetsAt: w.resetsAt }
  }
  return { fiveHour: meter('five_hour'), week: meter('seven_day') }
}

// Grün bis 60 %, gelb bis 85 %, dann rot
const colorFor = (percent: number) =>
  percent >= 85 ? '#f85149' : percent >= 60 ? '#d29922' : '#3fb950'

const formatReset = (iso: string | undefined, withDay: boolean) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  try {
    const opts: Intl.DateTimeFormatOptions = withDay
      ? { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE }
      : { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE }
    const text = d.toLocaleString('de-DE', opts).replace(/\.,?/, '')
    return withDay ? `Reset ${text}` : `Reset ${text} Uhr`
  } catch {
    return `Reset ${d.toISOString().slice(11, 16)} UTC`
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    const usage = await $.session.usage()
    await update($, limits, () => toLimits(usage.rateLimits))
    return result
  })

  on('session.measure', async ($, e, next) => {
    await update($, limits, () => toLimits(e.rateLimits))
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const current = await read($, limits)
    if (e.props.hasSurvey || current === null) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    // Eine Zeile pro Balken, als ein einziger Text, damit nichts auseinanderbricht
    const meter = (label: string, value: Meter | undefined, reset: string) => {
      if (value === undefined) return null
      const { percent } = value
      const filled = Math.min(CELLS, Math.max(percent > 0 ? 1 : 0, Math.round((percent / 100) * CELLS)))
      const color = colorFor(percent)
      return (
        <Box flexShrink={0} marginRight={4}>
          <Text wrap="truncate-end">
            <Text weight="semibold">{label} </Text>
            <Text color={color}>{'█'.repeat(filled)}</Text>
            <Text dimColor>{'░'.repeat(CELLS - filled)}</Text>
            <Text color={color} tabular> {Math.round(percent)} %</Text>
            {reset ? <Text dimColor>  {reset}</Text> : null}
          </Text>
        </Box>
      )
    }

    const parts = [
      meter('5-Std-Limit', current.fiveHour, formatReset(current.fiveHour?.resetsAt, false)),
      meter('Wochenlimit', current.week, formatReset(current.week?.resetsAt, true)),
    ].filter(Boolean)

    if (parts.length === 0) {
      return next(e)
    }

    const isWide = e.props.bodyColumns >= ONE_ROW_COLUMNS
    return <Box flexDirection={isWide ? 'row' : 'column'}>{parts}</Box>
  })
}
