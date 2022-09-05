import { GoalstrackerApiStack } from "../../cdk/goalstracker-api-stack";
import { App } from "aws-cdk-lib";
import { Environment } from "../../cdk/environment";

export const getStack = (environment: Environment): GoalstrackerApiStack => {
  const app = new App();

  return new GoalstrackerApiStack(app, `${ environment }TestStack`, {
    environment
  })
}
