import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { CronConstruct } from "./constructs/cron-construct";
import { ApiConstruct } from "./constructs/api-construct";
import { EventQueueConstruct } from "./constructs/event-queue-construct";

export class FreeMarketFandangoApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dataTable = new dynamodb.TableV2(this, 'Data', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const eventQueue = new EventQueueConstruct(this, 'EventQueue', {
      dataTable,
    })

    new ApiConstruct(this, 'API', {
      dataTable,
      eventQueue: eventQueue.sqsQueue
    })

    new CronConstruct(this, 'Cron', {
      dataTable,
      eventQueue: eventQueue.sqsQueue
    });
  }
}
