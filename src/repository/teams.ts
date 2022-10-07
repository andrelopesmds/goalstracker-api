import { Team } from '../interfaces/team.interface';
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { TEAMS_TABLE } from '../constants';
import { DynamoDB } from './dynamodb';


export class TeamsRepository extends DynamoDB {
  tableName: string

  constructor() {
    super()

    this.tableName = TEAMS_TABLE
  }
  
  async getTeams(): Promise<Team[]> {
    const scanCommand = new ScanCommand({
      TableName: this.tableName 
    })

    const response = await this.dynamoDBDocumentClient.send(scanCommand)
    const teams = response.Items as Team[]

    console.log(`Teams loaded: ${JSON.stringify(teams)}`);
    return teams ?? []
  }
}
