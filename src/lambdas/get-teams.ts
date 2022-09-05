import { getTeams } from '../repository/teams';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ORIGIN } from '../constants';

export const handler = async (): Promise<APIGatewayProxyResult> => {
  const teams = await getTeams();

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
