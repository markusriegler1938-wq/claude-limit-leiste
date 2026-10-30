export type Meter = { percent: number; resetsAt?: string }
export type Limits = { context?: number; fiveHour?: Meter; week?: Meter }

declare module 'claude-code' {
  interface PluginState {
    'limit-band': { limits: Limits | null }
  }
}
