
import { Event } from '../interfaces/event.interface';
import { ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { EVENTS_TABLE } from '../constants';
import { DynamoDB } from './dynamodb';

export class EventsRepository extends DynamoDB {
  tableName: string

  constructor() {
    super()

    this.tableName = EVENTS_TABLE
  }
  
  async getEvents(minutesToTrack: number): Promise<Event[]> {
    const timestamp = (new Date((new Date().getTime()) - minutesToTrack * 60000)).toISOString();

    console.log('table name is: ', this.tableName)

    const scanCommand = new ScanCommand({
      TableName: this.tableName
    })

    const response = await this.dynamoDBDocumentClient.send(scanCommand)
    const events = response.Items as Event[]

    console.log(`Events loaded: ${JSON.stringify(events)}`);

    const recentEvents = events.filter(x => x.timestamp && x.timestamp > timestamp)
    
    return recentEvents ?? []
  }

  async saveEventsList(events: Event[]): Promise<void> {
    // TODO - use batch operation
    for (const event of events) {
      const putCommand = new PutCommand({
        TableName: this.tableName,
        Item: {
          ...event,
          timestamp: new Date().toISOString(),
          homeTeamId: event.homeTeamId ?? '',
          awayTeamId: event.awayTeamId ?? '',
          currentStatus: event.score.includes('0 x 0') ? 'Game started' : 'Goal'
        }
      })

      const response = await this.dynamoDBDocumentClient.send(putCommand)
      console.log(`Event saved: ${JSON.stringify(response)}`);
    }
  }
}
