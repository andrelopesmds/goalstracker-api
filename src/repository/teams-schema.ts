import { Schema, model } from 'dynamoose';
import { TEAMS_TABLE } from '../constants';
import { Team } from '../interfaces/team.interface';
import { Document } from 'dynamoose/dist/Document';

const teamsSchema = new Schema({
  id: {
    type: String,
    required: true,
    hashKey: true,
  },
  name: {
    type: String,
    required: true,
  },
  sport: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

interface TeamsDocument extends Team, Document {}

export const TeamModel = model<TeamsDocument>(TEAMS_TABLE, teamsSchema, {
  create: false
});
