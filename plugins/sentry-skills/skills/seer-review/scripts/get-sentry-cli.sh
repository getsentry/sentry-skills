#!/bin/bash
# Returns the path to sentry-cli.
# Uses SENTRY_CLI_PATH environment variable if set, otherwise falls back to "sentry-cli" (resolved via PATH).
echo "${SENTRY_CLI_PATH:-sentry-cli}"
