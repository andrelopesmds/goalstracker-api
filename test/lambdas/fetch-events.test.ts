import { handler } from '../../src/lambdas/fetch-events'
import { EventsRepository } from '../../src/repository/events'
import axios from 'axios'
import { SportsLiveScoresMatch } from '../../src/interfaces/sports-live-score-match.interface'
import { TeamsRepository } from '../../src/repository/teams'
import { Team } from '../../src/interfaces/team.interface'

jest.mock('../../src/repository/teams')
const getTeamsMock = jest.mocked(TeamsRepository.prototype.getTeams)

jest.mock('axios')
const axiosRequestMock = jest.mocked(axios.request)

jest.mock('../../src/repository/events')
const eventsRepositoryMock = jest.mocked(EventsRepository)


const eventsMock: SportsLiveScoresMatch[] = [
  {
    'Home Team': 'home-team-test',
    'Away Team': 'away-team-test',
    'Home Score': 2,
    'Away Score': 0
  },
  {
    'Home Team': 'random-team-test',
    'Away Team': 'another-team-test',
    'Home Score': 1,
    'Away Score': 1
  }
]

const teamsMock: Team[] = [
  { name: 'home-team-test', id: '13', sport: 'mocked', country: 'mocked' },
  { name: 'away-team-test', id: '10', sport: 'mocked', country: 'mocked' }
]

describe('Fetch lambda', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getTeamsMock.mockResolvedValue(teamsMock)

    eventsRepositoryMock.prototype.getEvents.mockResolvedValue([])
    eventsRepositoryMock.prototype.saveEventsList.mockResolvedValue(undefined)

    axiosRequestMock.mockResolvedValue({ status: 200, data: { matches: eventsMock }})
  });

  it('should call the api', async () => {
    await handler();

    expect(axiosRequestMock).toHaveBeenCalled()
  })

  it('should save the events list correctly', async () => {
    await handler();

    expect(eventsRepositoryMock.prototype.saveEventsList).toHaveBeenCalledWith(Array(1).fill(expect.anything()));

    expect(eventsRepositoryMock.prototype.saveEventsList).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          'homeTeam': 'home-team-test',
          'awayTeam': 'away-team-test',
          'homeTeamId': '13',
          'score': '2 x 0'
        })
      ]));
  });

  it('should not save if event already exists in DB', async () => {
    eventsRepositoryMock.prototype.getEvents.mockResolvedValue([{
      id: '123456',
      homeTeam: eventsMock[0]['Home Team'],
      awayTeam: eventsMock[0]['Away Team'],
      score: `${ eventsMock[0]['Home Score'] } x ${ eventsMock[0]['Away Score']}`
    }])

    await handler()

    expect(eventsRepositoryMock.prototype.saveEventsList).not.toBeCalled()
  })
});
