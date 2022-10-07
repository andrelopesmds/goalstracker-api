import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export class DynamoDB {
  dynamoDBDocumentClient: DynamoDBDocumentClient

  constructor() {
    this.dynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  }
}
