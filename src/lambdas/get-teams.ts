import { TeamsRepository } from '../repository/teams';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ORIGIN } from '../constants';

export const handler = async (): Promise<APIGatewayProxyResult> => {
  const teamsRepository = new TeamsRepository()
  const teams = await teamsRepository.getTeams()

  const body = JSON.stringify({
    teams,
  });

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': ORIGIN,
    },
    body
  };
};
