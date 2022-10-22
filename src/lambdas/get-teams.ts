import { TeamsRepository } from '../repository/teams';
import { APIGatewayProxyResult } from 'aws-lambda';
import { getSuccessfulResponse } from '../helper';

export const handler = async (): Promise<APIGatewayProxyResult> => {
  const teamsRepository = new TeamsRepository()
  const teams = await teamsRepository.getTeams()

  const body = JSON.stringify({
    teams,
  });

  return getSuccessfulResponse(body)
};
