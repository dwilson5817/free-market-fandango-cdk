import {Duration, Fn, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {BucketDeployment, Source} from "aws-cdk-lib/aws-s3-deployment";
import * as path from "path";
import {CloudFrontToS3} from "@aws-solutions-constructs/aws-cloudfront-s3";
import {Certificate} from "aws-cdk-lib/aws-certificatemanager";
import {Constants} from "./constants";
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";
import {LambdaRestApi} from "aws-cdk-lib/aws-apigateway";
import {SubnetType, Vpc} from "aws-cdk-lib/aws-ec2";
import {Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";

export class FreeMarketFandangoCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const certificate = Certificate.fromCertificateArn(this, 'Certificate', Constants.certificateArn);

    const cloudFrontToS3 = new CloudFrontToS3(this, 'CloudFrontToS3', {
      cloudFrontDistributionProps: {
        certificate: certificate,
        domainNames: [ Constants.frontendDomainName ],
      }
    });

    // new BucketDeployment(this, 'FrontendBucketDeployment', {
    //   sources: [ Source.asset( path.join(__dirname, '../frontend') ) ],
    //   destinationBucket: cloudFrontToS3.s3BucketInterface,
    // });

    const rdsVpc = new Vpc(this, 'PrivateVpc', {
        natGateways: 0,
        subnetConfiguration: [{
            cidrMask: 28,
            name: 'rds',
            subnetType: SubnetType.PRIVATE_ISOLATED
        }]
    });

    const lambdaRole = new Role(this, 'LambdaRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com')
    })

    const managedPolicy = new ManagedPolicy(this, 'LambdaManagedPolicy', {
      statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
              "ec2:CreateNetworkInterface",
              "ec2:DescribeNetworkInterfaces",
              "ec2:DeleteNetworkInterface",
              "ec2:AssignPrivateIpAddresses",
              "ec2:UnassignPrivateIpAddresses"
            ],
            resources: ['*']
          }
        )
      ],
      roles: [ lambdaRole ]
    })

    const flaskHandler = new Function(this, 'FlaskHandler', {
      runtime: Runtime.PYTHON_3_9,
      handler: 'handler.lambda_handler',
      code: Code.fromAsset( path.join(__dirname, '../lambda.zip') ),
      timeout: Duration.seconds(15),
      environment: {
        DATABASE_HOST: process.env.DATABASE_HOST || '',
        DATABASE_PORT: process.env.DATABASE_PORT || '',
        DATABASE_USER: process.env.DATABASE_USER || '',
        DATABASE_PASS: process.env.DATABASE_PASS || '',
        DATABASE_NAME: process.env.DATABASE_NAME || ''
      },
      vpc: rdsVpc,
      role: lambdaRole
    });

    new LambdaRestApi(this, 'FlaskApi', {
      handler: flaskHandler,
      domainName: {
        domainName: Constants.apiDomainName,
        certificate: certificate,
      },
    });
  }
}
