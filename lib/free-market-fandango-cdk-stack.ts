import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import * as path from "path";
import { CloudFrontToS3 } from "@aws-solutions-constructs/aws-cloudfront-s3";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Constants } from "./constants";
import { Code, Runtime} from "aws-cdk-lib/aws-lambda";
import { ApiGatewayToLambda } from "@aws-solutions-constructs/aws-apigateway-lambda";
import { HeadersFrameOption } from "aws-cdk-lib/aws-cloudfront";

export class FreeMarketFandangoCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const certificate = Certificate.fromCertificateArn(this, 'Certificate', Constants.certificateArn);

    const cloudFrontToS3 = new CloudFrontToS3(this, 'CloudFrontToS3Pattern', {
      cloudFrontDistributionProps: {
        certificate: certificate,
        domainNames: [ Constants.frontendDomainName ],
      },
      insertHttpSecurityHeaders: false,
      responseHeadersPolicyProps: {
        securityHeadersBehavior: {
          contentSecurityPolicy: {
            contentSecurityPolicy: `default-src 'none'; script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self'; font-src 'self' https://cdn.jsdelivr.net; connect-src https://${Constants.apiDomainName}`,
            override: true
          },
          contentTypeOptions: {
            override: true
          },
          frameOptions: {
            frameOption: HeadersFrameOption.DENY,
            override: true
          },
          strictTransportSecurity: {
            accessControlMaxAge: Duration.days(730),
            includeSubdomains: true,
            preload: true,
            override: true
          },
          xssProtection: {
            protection: true,
            modeBlock: true,
            override: true
          }
        },
      }
    });

    new BucketDeployment(this, 'FrontendBucketDeployment', {
      sources: [ Source.asset( path.join(__dirname, '../frontend') ) ],
      destinationBucket: cloudFrontToS3.s3BucketInterface,
    });

    const apiGatewayToLambda = new ApiGatewayToLambda(this, 'ApiGatewayToLambdaPattern', {
      lambdaFunctionProps: {
        runtime: Runtime.PYTHON_3_9,
        handler: 'handler.lambda_handler',
        code: Code.fromAsset( path.join(__dirname, '../lambda.zip') ),
        environment: {
          ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
          DATABASE_HOST: process.env.DATABASE_HOST || '',
          DATABASE_PORT: process.env.DATABASE_PORT || '',
          DATABASE_USER: process.env.DATABASE_USER || '',
          DATABASE_PASS: process.env.DATABASE_PASS || '',
          DATABASE_NAME: process.env.DATABASE_NAME || '',
          SECRET_KEY: process.env.SECRET_KEY || ''
        },
      },
      apiGatewayProps: {
        restApiName: this.stackName,
        defaultCorsPreflightOptions: {
          allowOrigins: [ `https://${Constants.frontendDomainName}` ],
          allowMethods: [ 'GET', 'PUT', 'POST' ]
        },
        domainName: {
          domainName: Constants.apiDomainName,
          certificate: certificate,
        }
      }
    });
  }
}
