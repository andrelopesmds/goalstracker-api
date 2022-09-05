import { Environment } from '../../cdk/environment';
import { getStack } from './stack-generator'
import { Template } from "aws-cdk-lib/assertions";
import { GoalstrackerApiStack } from '../../cdk/goalstracker-api-stack';

const ProvisionedThroughput = {
  ReadCapacityUnits: 1,
  WriteCapacityUnits: 1,
}

const StreamSpecification = {
  StreamViewType: 'NEW_IMAGE'
}

const mockedAwsAccountId = '123456789012'

describe('Database resources', () => {
  const environment = Environment.PROD
  let stack: GoalstrackerApiStack

  beforeAll(() => {
    process.env.AWS_ACCOUNT_ID = mockedAwsAccountId

    stack = getStack(environment)
  })

  afterAll(() => {
    delete process.env.AWS_ACCOUNT_ID
  })

  test('Should create the 3 tables', () => {
    Template.fromStack(stack).resourceCountIs('AWS::DynamoDB::Table', 3)
  })

  test('Should create the teams table', () => {
    Template.fromStack(stack).hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: `teams-table-${environment}`,
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH'
        }
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S'
        }
      ],
      ProvisionedThroughput
    })
  });

  test('Should create the subscriptions table', () => {
    Template.fromStack(stack).hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: `subscriptions-table-${environment}`,
      KeySchema: [
        {
          AttributeName: 'endpoint',
          KeyType: 'HASH'
        }
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'endpoint',
          AttributeType: 'S'
        }
      ],
      ProvisionedThroughput,
      StreamSpecification
    })
  })

  test('Should create the events table', () => {
    Template.fromStack(stack).hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: `events-table-${environment}`,
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH'
        }
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S'
        }
      ],
      ProvisionedThroughput,
      StreamSpecification
    })
  })
})
