#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FreeMarketFandangoCdkStack } from '../lib/free-market-fandango-cdk-stack';

const app = new cdk.App();
new FreeMarketFandangoCdkStack(app, 'FreeMarketFandango');
