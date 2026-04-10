import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { SqsToLambda } from "@aws-solutions-constructs/aws-sqs-lambda";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cdk from "aws-cdk-lib";
import * as logs from "aws-cdk-lib/aws-logs";

type EventQueueConstructProps = {
  artifactsBucket: s3.Bucket,
  dataTable: dynamodb.TableV2,
};

export class EventQueueConstruct extends Construct {
  readonly sqsQueue: sqs.Queue;

  constructor(scope: Construct, id: string, props: EventQueueConstructProps) {
    super(scope, id);

    const eventQueue = new SqsToLambda(this, 'EventsQueue', {
      queueProps: {
        fifo: true,
      },
      deployDeadLetterQueue: false,
      lambdaFunctionProps: {
        runtime: lambda.Runtime.PYTHON_3_13,
        handler: 'main.handler',
        code: lambda.Code.fromBucket(
          props.artifactsBucket,
          'free-market-fandango-queue-handler/queue_handler/function.zip',
          ssm.StringParameter.valueForStringParameter(this, '/free-market-fandango/artifacts/queue-handler/queue_handler/version'),
        ),
        timeout: cdk.Duration.seconds(15),
        logRetention: logs.RetentionDays.THREE_DAYS,
        environment: {
          DYNAMODB_TABLE_ARN: props.dataTable.tableName,
        },
      }
    });

    props.dataTable.grantReadWriteData(eventQueue.lambdaFunction);

    this.sqsQueue = eventQueue.sqsQueue
  }
}
