export type Meter = { percent: number; resetsAt?: string }
export type Limits = { fiveHour?: Meter; week?: Meter }

declare module 'claude-code' {
  interface PluginState {
    'limit-band': { limits: Limits | null }
  }
}
