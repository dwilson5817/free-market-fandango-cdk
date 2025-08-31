import { FRONTEND_DOMAIN_NAME } from './env';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as cdk from "aws-cdk-lib";
import * as path from "node:path";

export const buildAllowedOrigins = () => {
  const allowedOrigins = []

  if (FRONTEND_DOMAIN_NAME) allowedOrigins.push(`https://${FRONTEND_DOMAIN_NAME}`)
  allowedOrigins.push('http://localhost:5173')

  return allowedOrigins
}

export const buildLambdaProps = (packageName: string, environment: { [ k: string ]: string }) => ({
  runtime: lambda.Runtime.PYTHON_3_10,
  handler: `${packageName}.main.handler`,
  code: lambda.Code.fromAsset( path.join(__dirname, `../${packageName}`), {
    bundling: {
      image: lambda.Runtime.PYTHON_3_10.bundlingImage,
      command: [
        'bash', '-c', 'pip install -r requirements.txt -t /asset-output && cp -au . /asset-output'
      ],
    },
  }),
  timeout: cdk.Duration.seconds(15),
  logRetention: logs.RetentionDays.THREE_DAYS,
  environment,
})
