import { App } from 'aws-cdk-lib'
import { GoalstrackerApiStack } from './goalstracker-api-stack';
import { Environment } from './environment';

const environment = process.env.ENVIRONMENT === Environment.PROD ?  Environment.PROD : Environment.DEV;
const stackName = `goals-tracker-api-stack-${environment}`;

const app = new App();

new GoalstrackerApiStack(app, stackName, {
  stackName,
  environment,
  description: `Goals tracker stack api for ${environment} environment`
});
