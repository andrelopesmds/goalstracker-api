import { TeamModel } from './teams-schema';
import { Team } from '../interfaces/team.interface';

export const getTeams = async (): Promise<Team[]> => {
  const teams: Team[] = await TeamModel.scan().exec();
  
  console.log(`Teams loaded: ${JSON.stringify(teams)}`);
  return teams;
};
