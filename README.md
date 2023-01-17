# Free Market Fandango

A stock market themed party where drink choices and events affect prices.

## CDK

This is a **C**loud **D**evelopment **K**it (CDK) project used to deploy the frontend and API to AWS.

The frontend is deployed using the `aws-cloudfront-s3` construct which deploys the code to an S3 bucket and serves it using CloudFront.  The API is deployed as a Lambda function behind API Gateway.

## Environment variables

The CI pipeline expects the following environment variables:

- `FRONTEND_DOWNLOAD_URL`: URL to download the frontend archive.
- `LAMBDA_DOWNLOAD_URL`: URL to download the API Lambda function archive.

The CDK expects the following variables for authenticating with AWS: `AWS_ACCESS_KEY_ID`, `AWS_DEFAULT_REGION`, `AWS_SECRET_ACCESS_KEY`.

The following environment variables are also expected:  `ADMIN_PASSWORD`,  `SECRET_KEY`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASS`, `DATABASE_NAME`.  These variables are passed to the Lambda function.  For more information, see the [API project](https://gitlab.dylanwilson.dev/free-market-fandango/api/-/blob/main/README.md).

## License

This application is licensed under version 3 of the GNU General Public License.  A copy of the license is available [on GitLab](https://gitlab.dylanwilson.dev/free-market-fandango/frontend/-/blob/main/LICENSE).
