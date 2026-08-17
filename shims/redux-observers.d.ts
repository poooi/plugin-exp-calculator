declare module 'redux-observers' {
  interface MinimalStore {
    dispatch: (action: unknown) => unknown
    getState: () => unknown
    subscribe: (listener: () => void) => () => void
  }

  /** Opaque handle returned by `observer`, only ever handed back to `observe`. */
  export interface Observer {
    readonly __reduxObserver?: never
  }

  export function observe(
    store: MinimalStore,
    observers: Observer[],
    options?: Record<string, unknown>,
  ): () => void

  export function observer<S, T>(
    mapper: (state: S) => T,
    dispatcher: (
      dispatch: MinimalStore['dispatch'],
      current: T,
      previous: T,
    ) => void,
    locals?: Record<string, unknown>,
  ): Observer
}
