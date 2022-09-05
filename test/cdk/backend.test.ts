import { Template } from "aws-cdk-lib/assertions";
import { Environment } from '../../cdk/environment';
import { getStack } from './stack-generator';   
import { GoalstrackerApiStack } from "../../cdk/goalstracker-api-stack";

const mockedAwsAccountId = '123456789012'

describe('GoalstrackerApiStack - PROD', () => {
  const environment = Environment.PROD
  let stack: GoalstrackerApiStack

  beforeAll(() => {
    process.env.AWS_ACCOUNT_ID = mockedAwsAccountId

    stack = getStack(environment)
  })

  afterAll(() => {
    delete process.env.AWS_ACCOUNT_ID
  })

  it('should create the API Gateway', () => {
    Template.fromStack(stack).hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: `goalstracker-api-${environment}`
    });
  })

  it('should create the stage', () => {
    Template.fromStack(stack).hasResourceProperties('AWS::ApiGateway::Stage', {
      StageName: environment
    });
  })

  it('should create the domain name', () => {
    Template.fromStack(stack).hasResourceProperties('AWS::ApiGateway::DomainName', {
      DomainName: 'api.goalstracker.info'
    });
  })

  it('should use the right certificate', () => {
    Template.fromStack(stack).hasResourceProperties('AWS::ApiGateway::DomainName', {
      RegionalCertificateArn: `arn:aws:acm:us-east-1:${ mockedAwsAccountId }:certificate/5e93f596-ecc6-42c7-87b8-0b65d36d9760`
    });
  })

  it('should create the base path mapping', () => {
    Template.fromStack(stack).resourceCountIs('AWS::ApiGateway::BasePathMapping', 1)
  })

  it('should create a record on Route53', () => {
    Template.fromStack(stack).hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'api.goalstracker.info.',
      Type: 'A',
      HostedZoneId: 'Z2HHG2D1UBSWF8'
    })
  })

  const apiResourcePaths = ['teams', 'subscriptions']
  it('should create the api resource paths', () => {
    const template = Template.fromStack(stack)

    template.resourceCountIs('AWS::ApiGateway::Resource', apiResourcePaths.length);

    apiResourcePaths.forEach(path => {
      template.hasResourceProperties('AWS::ApiGateway::Resource', {
        PathPart: path
      });
    });
  })

  it('should create the lambda functions', () => {
    const functionNames = [
      `create-subscription-${environment}`,
      `get-teams-${environment}`,
      `fetch-events-${environment}`,
      `dispatch-events-${environment}`,
      `welcome-event-${environment}`,
      `push-notification-${environment}`
    ]
    const template = Template.fromStack(stack)

    template.resourceCountIs('AWS::Lambda::Function', functionNames.length)

    functionNames.forEach(name => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: name,
        Handler: 'index.handler',
        Runtime: 'nodejs14.x'
      });
    }) 
  })

  it('should create the lambda permissions', () => {
    Template.fromStack(stack).resourceCountIs('AWS::Lambda::Permission', 6);
  })

  it('should create the options method', () => {
    Template.fromStack(stack).hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'OPTIONS',
      Integration: {
        IntegrationResponses: [{
          ResponseParameters: {
            'method.response.header.Access-Control-Allow-Origin': `\'https://goalstracker.info\'`
          }
        }]
      }
    });
  })

  it('should create an SNS Topic', () => {
    Template.fromStack(stack).hasResourceProperties('AWS::SNS::Topic', {
      TopicName: `notifications-topic-${environment}`,
    });
  })

  it('should set an events rule', () => {
    Template.fromStack(stack).hasResourceProperties('AWS::Events::Rule', {
      ScheduleExpression: 'rate(90 minutes)',
      State: 'ENABLED'
    });
  })
});

describe('GoalstrackerApiStack - DEV', () => {
  const environment = Environment.DEV
  let stack: GoalstrackerApiStack

  beforeAll(() => {
    process.env.AWS_ACCOUNT_ID = mockedAwsAccountId

    stack = getStack(environment)
  })

  afterAll(() => {
    delete process.env.AWS_ACCOUNT_ID
  })

  it('should create the domain name', () => {
    Template.fromStack(stack).hasResourceProperties('AWS::ApiGateway::DomainName', {
      DomainName: 'apidev.goalstracker.info'
    });
  })

  it('should create a record on Route53', () => {
    Template.fromStack(stack).hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'apidev.goalstracker.info.',
      Type: 'A'
    })
  })

  it('should create the options method for %s environment', () => {
    Template.fromStack(stack).hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'OPTIONS',
      Integration: {
        IntegrationResponses: [{
          ResponseParameters: {
            'method.response.header.Access-Control-Allow-Origin': `\'https://dev.goalstracker.info\'`
          }
        }]
      }
    });
  })

  it('should set an events rule', () => {
    Template.fromStack(stack).hasResourceProperties('AWS::Events::Rule', {
      ScheduleExpression: 'rate(4 hours)',
      State: 'ENABLED'
    });
  })
})
