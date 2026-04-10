import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import { CronConstruct } from "./constructs/cron-construct";
import { ApiConstruct } from "./constructs/api-construct";
import { EventQueueConstruct } from "./constructs/event-queue-construct";

export class FreeMarketFandangoCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const artifactsBucket = new s3.Bucket(this, 'ArtifactsBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [{
        noncurrentVersionExpiration: cdk.Duration.days(1),
        noncurrentVersionsToRetain: 5,
      }],
    });

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
