export interface ProbationTeamsClient {
    getFunctionalMailbox: (lduCode: string) => Promise<string>
}
