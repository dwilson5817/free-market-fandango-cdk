import { Construct } from "constructs";
import { EventbridgeToLambda } from "@aws-solutions-constructs/aws-eventbridge-lambda";
import * as events from "aws-cdk-lib/aws-events";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as logs from "aws-cdk-lib/aws-logs";

type CronConstructProps = {
  artifactsBucket: s3.Bucket,
  dataTable: dynamodb.TableV2,
  eventQueue: sqs.Queue
};

export class CronConstruct extends Construct {
  constructor(scope: Construct, id: string, props: CronConstructProps) {
    super(scope, id);

    const cron = new EventbridgeToLambda(this, 'Cron', {
      lambdaFunctionProps: {
        runtime: lambda.Runtime.PYTHON_3_13,
        handler: 'main.handler',
        code: lambda.Code.fromBucket(
            props.artifactsBucket,
            'free-market-fandango-cron/cron_handler/function.zip',
            ssm.StringParameter.valueForStringParameter(this, '/free-market-fandango/artifacts/cron/cron_handler/version'),
        ),
        timeout: cdk.Duration.seconds(15),
        logRetention: logs.RetentionDays.THREE_DAYS,
        environment: {
          SQS_QUEUE_URL: props.eventQueue.queueUrl,
          DYNAMODB_TABLE_ARN: props.dataTable.tableName,
        },
      },
      eventRuleProps: {
        schedule: events.Schedule.rate(cdk.Duration.minutes(1))
      }
    });

    props.eventQueue.grantSendMessages(cron.lambdaFunction);
    props.dataTable.grantReadData(cron.lambdaFunction);
  }
}
