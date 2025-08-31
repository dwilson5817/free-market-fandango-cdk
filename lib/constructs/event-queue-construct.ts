import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { buildLambdaProps } from "../utils";
import { SqsToLambda } from "@aws-solutions-constructs/aws-sqs-lambda";

type EventQueueConstructProps = {
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
      lambdaFunctionProps: buildLambdaProps('free-market-fandango-queue-handler', {
        DYNAMODB_TABLE_ARN: props.dataTable.tableName,
      })
    });

    props.dataTable.grantReadWriteData(eventQueue.lambdaFunction);

    this.sqsQueue = eventQueue.sqsQueue
  }
}
