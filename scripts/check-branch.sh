#!/usr/bin/env sh

branch="$(git rev-parse --abbrev-ref HEAD)"

if [ "$branch" = "production" ]; then
  echo "You are on the production branch. Commits can't be directly made to production branch."
  echo "Make a PR to merge changes to production."
  exit 1
fi
