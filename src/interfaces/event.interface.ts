export interface Event {
  id: string,
  homeTeam: string,
  homeTeamId?: string,
  score: string,
  awayTeam: string,
  awayTeamId? : string,
  timestamp?: string,
  currentStatus? : string
}
