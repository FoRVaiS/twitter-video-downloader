declare module 'm3u8-parser' {
  export class Parser {
    public manifest: {
      allowCache: boolean
      custom?: Record<string, any>
      discontinuitySequence: number
      discontinuityStarts: Array<unknown>
      endList: boolean
      mediaSequence: number
      playlistType: string
      playlists: Array<{
        attributes: {
          'AVERAGE-BANDWIDTH': string
          BANDWIDTH: number
          CODECS: string
          RESOLUTION: {
            width: number
            height: number
          }
        },
        timeline: number
        uri: string
      }>
      segments: Array<{
        duration: number
        timeline: number
        uri: string
      }>
      targetDuration: number
      version: number
    }

    public addParser(parser: {
      expression: RegExp | string,
      customType: string,
      dataParser: (line: string) => string
    }): void

    public push(manifest: string): void
    public end(): void
  }
}