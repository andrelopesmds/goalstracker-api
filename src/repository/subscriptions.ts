import { Subscription } from '../interfaces/subscription.interface';
import { ScanCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SUBSCRIPTIONS_TABLE } from '../constants';
import { DynamoDB } from './dynamodb';

export class SubscriptionsRepository extends DynamoDB {
  tableName: string

  constructor() {
    super()

    this.tableName = SUBSCRIPTIONS_TABLE
  }
  
  async getSubscription(endpoint: Subscription['endpoint']): Promise<Subscription> {
    const getCommand = new GetCommand({
      TableName: this.tableName,
      Key: {
        endpoint
      }
    })

    const response = await this.dynamoDBDocumentClient.send(getCommand)
    const subscription = response.Item as Subscription
      
    console.log(`Subscription loaded: ${JSON.stringify(subscription)}`);
    return subscription
  }

  async getActiveSubscriptions(): Promise<Subscription[]> {
    const scanCommand = new ScanCommand({
      TableName: this.tableName
    })

    const response = await this.dynamoDBDocumentClient.send(scanCommand)
    const subscriptions = response.Items as Subscription[]
      
    console.log(`Subscription loaded: ${JSON.stringify(subscriptions)}`);

    const activeSubscriptions = subscriptions.filter(x => !x.unsubscribeDate)

    return activeSubscriptions ?? []
  }

  async createSubscription (subscription: Subscription): Promise<void> {
    const putCommand = new PutCommand({
      TableName: this.tableName,
      Item: {
        ...subscription,
        subscribeDate: new Date().toISOString()
      }
    })

    const response = await this.dynamoDBDocumentClient.send(putCommand)
    console.log('createSubscription response', response)
  }

  async removeSubscription (endpoint: Subscription['endpoint']): Promise<void> {
    const subscription = await this.getSubscription(endpoint)

    const putCommand = new PutCommand({
      TableName: this.tableName,
      Item: {
        ...subscription,
        unsubscribeDate: new Date().toISOString()
      }
    })

    const response = await this.dynamoDBDocumentClient.send(putCommand)
    console.log('removeSubscription response', response)

    console.log(`Subscription removed: '${endpoint}`);
  }
}
