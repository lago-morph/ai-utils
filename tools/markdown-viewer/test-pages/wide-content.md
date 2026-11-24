# Wide content print test

This page exercises PDF export of tables and code blocks that are too wide
for a portrait page. Each element carries a marker (P-…, L-…, W-…, F-…)
naming where it should print: **P** portrait, **L** landscape,
**W** landscape with wrapped code lines, **F** landscape with forced word breaks.

## Narrow content

```bash
# P-CODE-NARROW
kubectl get pods -n default
```

| P-TABLE-NARROW | Value |
|----------------|-------|
| replicas       | 3     |
| image          | nginx |

## Table that fits portrait by wrapping prose

| P-TABLE-PROSE | Description | Notes |
|---------------|-------------|-------|
| Gateway | Routes inbound traffic to the cluster, terminates TLS, and enforces the per-route rate limits configured by the operator. | Must be redeployed whenever the certificate bundle rotates, which happens roughly every ninety days. |
| Secrets | Sole authority for actual secret values. Charts reference secret names and keys only, never the values themselves. | Missing required values halt the dependent release before it is invoked. |

## Table that fits portrait only by breaking on commas

| P-TABLE-COMMA | Lookup |
|---------------|--------|
| `accountId,region,vpcId,privateSubnetIds,publicSubnetIds` | `region,vpc_id,private_subnet_ids,public_subnet_ids,availability_zones` |
| `network.zone,webhook.host,gateway.host,kube.host` | `bitbucket.repo,bitbucket.baseBranch,bitbucket.authorUuid` |

Back to portrait text between wide elements.

## Code block that needs landscape

```text
L-CODE-WIDE: docker run --rm -e AWS_REGION=us-east-1 -v /var/run/docker.sock:/var/run/docker.sock ENDL1
```

| L-TABLE-WIDE | Key | Default | Source |
|--------------|-----|---------|--------|
| `network.zone:string` | `bitbucket.baseBranch:string` | `kagent-demo-api-gateway` | `terraform-output-private-subnet` |
| `host.instanceType:string` | `bitbucket.authorUuid:string` | `knightsky-devops-sandbox` | `aws-sts-get-caller-identity` ENDL2 |

Portrait text after the first landscape group.

## Table too wide even for landscape

| F-TABLE-FORCE | Col2 | Col3 | Col4 | Col5 | Col6 |
|---------------|------|------|------|------|------|
| `alpha.beta.gamma.delta.epsilon` | `zeta.eta.theta.iota.kappa.lambda` | `mu.nu.xi.omicron.pi.rho.sigma` | `tau.upsilon.phi.chi.psi.omega` | `one.two.three.four.five.six` | `seven.eight.nine.ten.eleven` ENDF |

Portrait text after the forced table.

## Code block too wide even for landscape

```text
W-CODE-WRAP: aws cloudformation deploy --template-file packaged.yaml --stack-name example-stack --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --parameter-overrides Environment=dev Region=us-east-1 ENDW
```

## Wide code nested in a list

1. First step, rendered in portrait.
2. Second step has a wide command:

   ```text
   L-CODE-LIST: helm upgrade --install gateway ./charts/gateway --namespace ingress -f dev.yaml ENDL3
   ```

P-END: final portrait paragraph.
