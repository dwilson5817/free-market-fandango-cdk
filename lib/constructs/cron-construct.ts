import { Construct } from "constructs";
import { EventbridgeToLambda } from "@aws-solutions-constructs/aws-eventbridge-lambda";
import * as events from "aws-cdk-lib/aws-events";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { buildLambdaProps } from "../utils";

type CronConstructProps = {
  dataTable: dynamodb.TableV2,
  eventQueue: sqs.Queue
};

export class CronConstruct extends Construct {
  constructor(scope: Construct, id: string, props: CronConstructProps) {
    super(scope, id);

    const cron = new EventbridgeToLambda(this, 'Cron', {
      lambdaFunctionProps: buildLambdaProps('free-market-fandango-cron', {
        SQS_QUEUE_URL: props.eventQueue.queueUrl,
        DYNAMODB_TABLE_ARN: props.dataTable.tableName,
      }),
      eventRuleProps: {
        schedule: events.Schedule.rate(cdk.Duration.minutes(1))
      }
    });

    props.eventQueue.grantSendMessages(cron.lambdaFunction);
    props.dataTable.grantReadData(cron.lambdaFunction);
  }
}
