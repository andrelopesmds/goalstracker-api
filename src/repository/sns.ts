import { SNSClient } from '@aws-sdk/client-sns';

export class SNS {
  snsClient: SNSClient

  constructor() {
    this.snsClient = new SNSClient({});
  }
}
