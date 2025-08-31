import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { buildAllowedOrigins, buildLambdaProps } from "../utils";
import { ApiGatewayToLambda } from "@aws-solutions-constructs/aws-apigateway-lambda";
import {
    ADMIN_PASSWORD,
    API_DOMAIN_NAME,
    CERTIFICATE_ARN,
    SPOTIPY_CLIENT_ID,
    SPOTIPY_CLIENT_SECRET,
    SPOTIPY_REDIRECT_URI
} from "../env";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";

type ApiConstructProps = {
  dataTable: dynamodb.TableV2,
  eventQueue: sqs.Queue
};

export class ApiConstruct extends Construct {
  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    const certificate = CERTIFICATE_ARN ? certificatemanager.Certificate.fromCertificateArn(this, 'Certificate', CERTIFICATE_ARN) : undefined;

    const api = new ApiGatewayToLambda(this, 'API', {
      lambdaFunctionProps: buildLambdaProps('free-market-fandango-api', {
        ADMIN_PASSWORD,
        SPOTIPY_CLIENT_ID,
        SPOTIPY_CLIENT_SECRET,
        SPOTIPY_REDIRECT_URI,
        SECRET_KEY: require('crypto').randomBytes(64).toString('hex'),
        SQS_QUEUE_URL: props.eventQueue.queueUrl,
        DYNAMODB_TABLE_ARN: props.dataTable.tableName,
      }),
      apiGatewayProps: {
        restApiName: cdk.Stack.of(this).stackName,
        defaultCorsPreflightOptions: {
          allowOrigins: buildAllowedOrigins(),
          allowMethods: [ 'GET', 'PUT', 'POST', 'DELETE' ]
        },
        ...API_DOMAIN_NAME && {
          domainName: {
            domainName: API_DOMAIN_NAME,
            certificate: certificate,
          },
        },
        defaultMethodOptions: {
          authorizationType: apigateway.AuthorizationType.NONE
        }
      }
    });

    props.dataTable.grantReadWriteData(api.lambdaFunction);
    props.eventQueue.grantSendMessages(api.lambdaFunction);
  }
}
