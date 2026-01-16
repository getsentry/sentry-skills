#!/bin/bash
# Runs sentry-cli review command.
# Uses SENTRY_CLI_PATH environment variable if set, otherwise falls back to "sentry-cli" (resolved via PATH).
SENTRY_CLI="${SENTRY_CLI_PATH:-sentry-cli}"
exec "$SENTRY_CLI" review "$@"
