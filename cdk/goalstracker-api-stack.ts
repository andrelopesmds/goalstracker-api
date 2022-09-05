import { Stack, StackProps, Duration } from 'aws-cdk-lib'
import { Environment } from './environment'
import { Construct } from 'constructs'
import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import { HostedZone, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53'
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets'
import { Topic } from 'aws-cdk-lib/aws-sns'
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { StartingPosition } from 'aws-cdk-lib/aws-lambda'
import { Rule, Schedule } from 'aws-cdk-lib/aws-events'
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets'
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions'
import { Table, AttributeType, StreamViewType } from 'aws-cdk-lib/aws-dynamodb'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'

interface GoalstrackerApiProps extends StackProps {
  environment: Environment
}

export class GoalstrackerApiStack extends Stack {
  constructor(scope: Construct, id: string, props: GoalstrackerApiProps) {
    super(scope, id, props)

    const { environment } = props

    const subdomain = environment === Environment.PROD ? '' : 'dev.'
    const origin = `https://${subdomain}goalstracker.info`;

    const subdomainApi = environment === Environment.PROD ? 'api' : 'apidev';
    const apiDomainName = `${subdomainApi}.goalstracker.info`;

    const region = 'us-east-1'
    const accountId = process.env.AWS_ACCOUNT_ID ?? ''

    const certificateArn = `arn:aws:acm:${region}:${accountId}:certificate/5e93f596-ecc6-42c7-87b8-0b65d36d9760`

    const api = new RestApi(this, `goalstracker-api-${environment}`, {
      restApiName: `goalstracker-api-${environment}`,
      domainName: {
        domainName: apiDomainName,
        certificate: Certificate.fromCertificateArn(this, 'domainNameCertificate', certificateArn),
      },
      deployOptions: {
        stageName: environment,
      },
      disableExecuteApiEndpoint: true,
      defaultCorsPreflightOptions: {
        allowOrigins: [origin]
      }
    });

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'hostedZone', {
      hostedZoneId: 'Z2HHG2D1UBSWF8',
      zoneName: 'goalstracker.info'
    });

    new ARecord(this, `ApiRecord-${environment}`, {
      zone: hostedZone,
      recordName: apiDomainName,
      target: RecordTarget.fromAlias(new ApiGateway(api))
    });

    const [teamsTable, subscriptionsTable, eventsTable] = this.createTables(environment)

    const notificationsTopic = new Topic(this, `notifications-topic-${environment}`, {
      topicName: `notifications-topic-${environment}`,
      displayName: `notifications-topic-${environment}`
    });

    const  [
      createSubscription,
      getTeams,
      fetchEvents,
      dispatchEvents,
      welcomeEvent,
      pushNotification
    ] = this.createLambdas(environment, origin, {
      subscriptionsTable: subscriptionsTable.tableName,
      eventsTable: eventsTable.tableName,
      teamsTable: teamsTable.tableName
    }, notificationsTopic.topicArn)

    dispatchEvents.addEventSource(new DynamoEventSource(eventsTable, {
      startingPosition: StartingPosition.LATEST
    }));

    welcomeEvent.addEventSource(new DynamoEventSource(subscriptionsTable, {
      startingPosition: StartingPosition.LATEST
    }));

    const duration = environment === Environment.PROD ? Duration.minutes(90) : Duration.hours(4)
    const rule = new Rule(this, `rule-${environment}`, {
      schedule: Schedule.rate(duration)
    });

    rule.addTarget(new LambdaFunction(fetchEvents));

    notificationsTopic.grantPublish(dispatchEvents);
    notificationsTopic.grantPublish(welcomeEvent);
    notificationsTopic.addSubscription(new LambdaSubscription(pushNotification));

    const subscriptionsResource = api.root.addResource('subscriptions');
    const teamsResource = api.root.addResource('teams');

    subscriptionsResource.addMethod('POST', new LambdaIntegration(createSubscription));
    teamsResource.addMethod('GET', new LambdaIntegration(getTeams));

    // todo - why is not 'describeTable added when using 'grantReadAccess'?
    teamsTable.grantFullAccess(getTeams);
    teamsTable.grantFullAccess(fetchEvents);
    subscriptionsTable.grantFullAccess(dispatchEvents);
    subscriptionsTable.grantFullAccess(createSubscription);
    subscriptionsTable.grantFullAccess(pushNotification);
    eventsTable.grantFullAccess(fetchEvents);
  }

  private createTables = (environment: Environment): Table[] => {
    const teamsTable = new Table(this, `teams-table-${environment}`, {
      tableName: `teams-table-${environment}`,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      readCapacity: 1,
      writeCapacity: 1
    });

    const subscriptionsTable = new Table(this, `subscriptions-table-${environment}`, {
      tableName: `subscriptions-table-${environment}`,
      partitionKey: {
        name: 'endpoint',
        type: AttributeType.STRING
      },
      stream: StreamViewType.NEW_IMAGE,
      readCapacity: 1,
      writeCapacity: 1
    });

    const eventsTable = new Table(this, `events-table-${environment}`, {
      tableName: `events-table-${environment}`,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      stream: StreamViewType.NEW_IMAGE,
      readCapacity: 1,
      writeCapacity: 1
    });

    return [teamsTable, subscriptionsTable, eventsTable]
  }

  private createLambdas = (
    environment: Environment,
    origin: string,
    tableNames: {
      subscriptionsTable: string,
      teamsTable: string,
      eventsTable: string
    },
    notificationsTopicArn: string): NodejsFunction[] => {

    const createSubscription = new NodejsFunction(this, `create-subscription-${environment}`, {
      functionName: `create-subscription-${environment}`,
      entry: 'src/lambdas/create-subscription.ts',
      handler: 'handler',
      environment: {
        SUBSCRIPTIONS_TABLE: tableNames.subscriptionsTable,
        ORIGIN: origin
      },
    });

    const getTeams = new NodejsFunction(this, `get-teams-${environment}`, {
      functionName: `get-teams-${environment}`,
      entry: 'src/lambdas/get-teams.ts',
      handler: 'handler',
      environment: {
        TEAMS_TABLE: tableNames.teamsTable,
        ORIGIN: origin
      },
    });

    const fetchEvents = new NodejsFunction(this, `fetch-events-${environment}`, {
      functionName: `fetch-events-${environment}`,
      entry: 'src/lambdas/fetch-events.ts',
      handler: 'handler',
      environment: {
        EVENTS_TABLE: tableNames.eventsTable,
        TEAMS_TABLE: tableNames.teamsTable,
        SPORTS_LIVE_SCORES_API_KEY: process.env.SPORTS_LIVE_SCORES_API_KEY ?? ''
      },
    });

    const dispatchEvents = new NodejsFunction(this, `dispatch-events-${environment}`, {
      functionName: `dispatch-events-${environment}`,
      entry: 'src/lambdas/dispatch-events.ts',
      handler: 'handler',
      environment: {
        SUBSCRIPTIONS_TABLE: tableNames.subscriptionsTable,
        NOTIFICATIONS_TOPIC_ARN: notificationsTopicArn,
      }
    });

    const welcomeEvent = new NodejsFunction(this, `welcome-event-${environment}`, {
      functionName: `welcome-event-${environment}`,
      entry: 'src/lambdas/welcome-event.ts',
      handler: 'handler',
      environment: {
        NOTIFICATIONS_TOPIC_ARN: notificationsTopicArn,
      }
    });

    const pushNotification = new NodejsFunction(this, `push-notification-${environment}`, {
      functionName: `push-notification-${environment}`,
      entry: 'src/lambdas/push-notification.ts',
      handler: 'handler',
      environment: {
        WEB_PUSH_PUBLIC_KEY: process.env.WEB_PUSH_PUBLIC_KEY ?? '',
        WEB_PUSH_PRIVATE_KEY: process.env.WEB_PUSH_PRIVATE_KEY ?? '',
        SUBSCRIPTIONS_TABLE: tableNames.subscriptionsTable,
      }
    });

    return [
      createSubscription,
      getTeams,
      fetchEvents,
      dispatchEvents,
      welcomeEvent,
      pushNotification
    ]
  }
}
