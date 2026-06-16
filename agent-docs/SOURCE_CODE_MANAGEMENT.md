Project uses git for version control
Husky is used as git hook manager

These three hooks are configured

1. Format the staged files before commit,
2. Push only when the build is successfully made,
3. Validate commit messages with commitlint.
4. Commits to production are not allowed. Create a new branch, commit, and then create the PR for merging changes to production
