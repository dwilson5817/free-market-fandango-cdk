export const FRONTEND_DOMAIN_NAME = process.env.CDK_FRONTEND_DOMAIN_NAME;
export const API_DOMAIN_NAME = process.env.CDK_API_DOMAIN_NAME;
export const CERTIFICATE_ARN = process.env.CDK_CERTIFICATE_ARN;

export const ADMIN_PASSWORD = process.env.LAMBDA_ADMIN_PASSWORD || '';
export const SPOTIPY_CLIENT_ID = process.env.LAMBDA_SPOTIPY_CLIENT_ID || '';
export const SPOTIPY_CLIENT_SECRET = process.env.LAMBDA_SPOTIPY_CLIENT_SECRET || '';
export const SPOTIPY_REDIRECT_URI = process.env.LAMBDA_SPOTIPY_REDIRECT_URI || '';
