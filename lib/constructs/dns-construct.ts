import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import { DOMAIN_NAME } from "../env";

type ApiConstructProps = {};

export class DnsConstruct extends Construct {
  readonly hostedZone: route53.IHostedZone;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    if (!DOMAIN_NAME) {
      throw new Error('DOMAIN_NAME environment variable is required');
    }

    this.hostedZone = new route53.HostedZone(this, 'HostedZone', {
      zoneName: DOMAIN_NAME,
    });

    new cdk.CfnOutput(this, 'HostedZoneNameServers', {
      description: 'NS records to add to delegate domain to Route 53',
      value: cdk.Fn.join(', ', this.hostedZone.hostedZoneNameServers!),
    });

    // Permit ACM to issue certificates on this zone
    new route53.CaaRecord(this, 'AcmCaaRecord', {
      zone: this.hostedZone,
      values: [
        { flag: 0, tag: route53.CaaTag.ISSUE, value: 'amazon.com' },
        { flag: 0, tag: route53.CaaTag.ISSUE, value: 'amazontrust.com' },
        { flag: 0, tag: route53.CaaTag.ISSUE, value: 'awstrust.com' },
        { flag: 0, tag: route53.CaaTag.ISSUE, value: 'amazonaws.com' },
      ],
    });

    // Route 53 does not support ALIAS to external hostnames, so we use A/AAAA
    // records pointing to the GitLab Pages server (free-market-fandango.pages.dylanw.dev).
    new route53.ARecord(this, 'FrontendARecord', {
      zone: this.hostedZone,
      target: route53.RecordTarget.fromIpAddresses('51.38.73.143'),
    });

    new route53.AaaaRecord(this, 'FrontendAaaaRecord', {
      zone: this.hostedZone,
      target: route53.RecordTarget.fromIpAddresses('2001:41d0:800:3f6d:d23b:35f2:84ea:9e58'),
    });
  }
}
