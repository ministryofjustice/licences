
### Example test deploy command

```
helm --namespace licences-dev --tiller-namespace licences-dev upgrade licences ./licences/ --install --values=values-dev.yaml --values=secrets-example.yaml --dry-run --debug
```

Test template output:

```
helm template ./licences/ --values=values-dev.yaml --values=secrets-example.yaml
```

### Rolling back a release
Find the revision number for the deployment you want to roll back:
```
helm --tiller-namespace licences-dev history licences -o yaml
```
(note, each revision has a description which has the app version and circleci build URL)

Rollback
```
helm --tiller-namespace licences-dev rollback licences [INSERT REVISION NUMBER HERE] --wait
```

### Helm init

```
helm init --tiller-namespace licences-dev --service-account tiller --history-max 200
```

### Setup Lets Encrypt cert

Ensure the certificate definition exists in the cloud-platform-environments repo under the relevant namespaces folder

e.g.
```
cloud-platform-environments/namespaces/live-1.cloud-platform.service.justice.gov.uk/[INSERT NAMESPACE NAME]/05-certificate.yaml
```

### Adding secrets

Ensure that the following files are updated.

For secrets managed by the team and reside in AWS secret manager
- helm_deploy/licences/template/secrets.yaml 
- helm_deploy/licences/template/_envs.tpl
- helm_deploy/licences/secrets-example.yaml

For secrets managed by terraform
- helm_deploy/licences/template/_envs.tpl

When updating _envs.tpl ensure the name matches the one returned when running kubectl -n NAME_SPACE get secret
