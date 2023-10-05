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
import {AuthorizationType} from "aws-cdk-lib/aws-apigateway";

export class FreeMarketFandangoCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const distributionCertificate = Certificate.fromCertificateArn(this, 'Certificate', Constants.distributionCertificateArn);
    const apiGatewayCertificate = Certificate.fromCertificateArn(this, 'Certificate', Constants.apiGatewayCertificateArn);

    const cloudFrontToS3 = new CloudFrontToS3(this, 'CloudFrontToS3Pattern', {
      cloudFrontDistributionProps: {
        certificate: distributionCertificate,
        domainNames: [ Constants.frontendDomainName ],
      },
      insertHttpSecurityHeaders: false,
      responseHeadersPolicyProps: {
        securityHeadersBehavior: {
          contentSecurityPolicy: {
            contentSecurityPolicy: `default-src 'none'; script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' https://i.scdn.co data:; media-src 'self' https://files.dylanwilson.dev http://localhost; font-src 'self' https://cdn.jsdelivr.net; connect-src https://${Constants.apiDomainName}`,
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

    new ApiGatewayToLambda(this, 'ApiGatewayToLambdaPattern', {
      lambdaFunctionProps: {
        runtime: Runtime.PYTHON_3_10,
        handler: 'main.handler',
        code: Code.fromAsset( path.join(__dirname, '../lambda.zip') ),
        timeout: Duration.seconds(15),
        environment: {
          ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
          DATABASE_URL: process.env.DATABASE_URL || '',
          SECRET_KEY: process.env.SECRET_KEY || '',
          SPOTIPY_CLIENT_ID: process.env.SPOTIPY_CLIENT_ID || '',
          SPOTIPY_CLIENT_SECRET: process.env.SPOTIPY_CLIENT_SECRET || '',
          SPOTIPY_REDIRECT_URI: process.env.SPOTIPY_REDIRECT_URI || ''
        },
      },
      apiGatewayProps: {
        restApiName: this.stackName,
        defaultCorsPreflightOptions: {
          allowOrigins: [ `https://${Constants.frontendDomainName}` ],
          allowMethods: [ 'GET', 'PUT', 'POST', 'DELETE' ]
        },
        domainName: {
          domainName: Constants.apiDomainName,
          certificate: apiGatewayCertificate,
        },
        defaultMethodOptions: {
          authorizationType: AuthorizationType.NONE
        }
      }
    });
  }
}
