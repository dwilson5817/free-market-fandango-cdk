import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import * as path from "path";
import { CloudFrontToS3 } from "@aws-solutions-constructs/aws-cloudfront-s3";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Constants } from "./constants";
import { Function, Code, Runtime} from "aws-cdk-lib/aws-lambda";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";

export class FreeMarketFandangoCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const certificate = Certificate.fromCertificateArn(this, 'Certificate', Constants.certificateArn);

    const cloudFrontToS3 = new CloudFrontToS3(this, 'CloudFrontToS3', {
      cloudFrontDistributionProps: {
        certificate: certificate,
        domainNames: [ Constants.domainName ],
      }
    });

    new BucketDeployment(this, 'FrontendBucketDeployment', {
      sources: [ Source.asset( path.join(__dirname, '../frontend') ) ],
      destinationBucket: cloudFrontToS3.s3BucketInterface,
    });

    const flaskHandler = new Function(this, 'FlaskHandler', {
      runtime: Runtime.PYTHON_3_9,
      handler: 'handler.lambda_handler',
      code: Code.fromAsset( path.join(__dirname, '../lambda.zip') ),
    });

    new LambdaRestApi(this, 'FlaskApi', {
      handler: flaskHandler
    });
  }
}
