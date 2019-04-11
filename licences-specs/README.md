# licences-feature-specs

End-to-end tests for the Licences Application
see http://www.gebish.org/manual/current/

## Pre-Requisites

### Webdriver

Install current versions of chromedriver

### Environment

The following environment variables are used

- LICENCES_URI - root URI for the Licences application. Defaults to `http://localhost:3000`

The Licences application must be running at Licences_URI, and must be connected to a database and a nomis api or
suitable mocks, eg mojdigitalstudio/licences-nomis-mocks, and an oauth server eg mojdigitalstudio/nomis-oauth2-server.

eg you can use docker-compose up to start everything

## Execution

In src.test/resources/GebConfig.groovy you can change from headless mode
to browser mode with ChromeDriver. If not using the bundled Linux ChromeDriver, set the
webdriver.chrome.driver property with your ChromeDriver path.

Run with gradle or execute a specific test using your IDE.

`./gradlew test` or `./gradlew mockTest` - executes all specs

`./gradlew stageTest` - executes only specs marked with `@Stage`

## Writing Specs

- See http://www.gebish.org/manual/current/
- See http://spockframework.org/spock/docs/1.1/all_in_one.html

- Where specs relate to a particular user type, put them in a subdir named for that user type
- Use the PageObject style
- Prefer `@Stepwise` because it's a bit faster

### Stepwise specs

This means that the tests in a spec are executed from top to bottom. This means that each test
depends on the prevous tests. Disadvantage is not being able to run an individual test.
Advantage is not having to login and navigate back to the same page again.

When adding or changing tests, consider the context assumed by existing tests.

### Stage specs

Use the `@Stage' annotation on a spec or a test to mark it for execution against the stage environment.

Because this is a subset, consider what the context will be if previous tests in a Stepwise spec
are not executed.

Specs or individual tests should be tagged for stage only if they depend on an interaction with the
nomis elite2 api. If it doesn't use elite2, then there's no difference between mock and stage.

This only needs to include a few key tests that exercise the elite2 api interaction, not an exhaustive
duplication.

### Test Data

Automated tests employ user accounts specific for automated testing eg CA_USER_TEST.
