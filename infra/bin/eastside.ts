#!/usr/bin/env node
import { App, Tags, Validations } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { ENVIRONMENTS, SHARED } from '../lib/config';
import { EastsideStack } from '../lib/eastside-stack';
import { EastsideSharedStack } from '../lib/shared-stack';

const app = new App();

// The account comes from the deploying credentials; synth without credentials stays account-agnostic.
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: SHARED.region };
const deploymentVersion = String(app.node.tryGetContext('deploymentVersion') ?? 'local');

new EastsideSharedStack(app, 'EastsideShared', {
  env,
  description: 'East Side Distro: account-level CI/CD and email resources',
});

for (const config of ENVIRONMENTS) {
  const stack = new EastsideStack(app, config.stackName, {
    env,
    config,
    deploymentVersion,
    description: `East Side Distro website (${config.name})`,
    terminationProtection: config.isProduction,
  });
  Tags.of(stack).add('environment', config.name);
}

Tags.of(app).add('project', 'eastside-distro');

// Security/best-practice rules; findings fail synth unless fixed or acknowledged with a reason.
Validations.of(app).addPlugins(new AwsSolutionsChecks(app));
