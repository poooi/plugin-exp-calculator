interface PoiConfig {
  get: <T>(path: string, defaultValue: T) => T
  set: (path: string, value?: unknown) => void
}

interface PoiNotifyOptions {
  priority?: number
  stickyFor?: number
}

interface Window {
  ROOT: string
  APPDATA_PATH: string
  config: PoiConfig
  language: string
  getStore: <T = unknown>(path?: string) => T
  isMain: boolean
  success: (message: string, options?: PoiNotifyOptions) => void
}
