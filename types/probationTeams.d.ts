export interface ProbationTeamsClient {
  getFunctionalMailbox: (probationAreaCode: string, lduCode: string) => Promise<string>
}
