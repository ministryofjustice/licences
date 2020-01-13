export interface ProbationTeamsClient {
  getFunctionalMailbox: (probationAreaCode: string, lduCode: string, teamCode: string) => Promise<string>
}
