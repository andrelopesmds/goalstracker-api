import { mocked } from 'jest-mock';

import { handler } from '../../src/lambdas/get-teams';
import { Team } from '../../src/interfaces/team.interface';
import { TeamsRepository } from '../../src/repository/teams';

const teamsMock: Team[] = [
  {
    id: '13',
    name: 'test-team',
    country: 'brazil',
    sport: 'football'
  },
  {
    id: '14',
    name: 'test-team-2',
    country: 'brazil',
    sport: 'football'
  }
];

jest.mock('../../src/repository/teams');
const getTeamsMock = mocked(TeamsRepository.prototype.getTeams);

describe('Get teams lambda', () => {

  it('Should get all teams', async () => {
    getTeamsMock.mockResolvedValue(teamsMock)

    const expectedBody = JSON.stringify({ teams: teamsMock });

    const { statusCode, body } = await handler();

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual(expectedBody);
  });

  it('Should return an empty array if there is no teams available', async () => {
    getTeamsMock.mockResolvedValue([])

    const expectedBody = JSON.stringify({ teams: [] });

    const { statusCode, body } = await handler();

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual(expectedBody);
  });
});
