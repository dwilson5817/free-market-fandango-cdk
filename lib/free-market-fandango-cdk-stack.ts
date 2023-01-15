import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import * as path from "path";
import { CloudFrontToS3 } from "@aws-solutions-constructs/aws-cloudfront-s3";

export class FreeMarketFandangoCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cloudFrontToS3 = new CloudFrontToS3(this, 'CloudFrontToS3', {})

    new BucketDeployment(this, 'FrontendBucketDeployment', {
      sources: [ Source.asset( path.join(__dirname, '../frontend') ) ],
      destinationBucket: cloudFrontToS3.s3BucketInterface,
    });
  }
}
