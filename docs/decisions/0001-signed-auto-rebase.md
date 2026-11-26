# 0001: Keep PRs rebased automatically with signed commits

- Status: Accepted (stage 1)
- Date: 2026-11-26
- Spec: [specs/signed-rebase.feature](../../specs/signed-rebase.feature)

## Context

Every open PR should stay rebased on `main`, and every commit should carry a
verified signature. Three problems stood in the way:

1. GitHub's own **Update branch (rebase)** and **Rebase and merge** produce
   unsigned commits. GitHub documents this; there is no setting to change it.
2. The existing `rebase-next` job called `gh pr update-branch --rebase` with a
   personal access token, so each rebase left the PR with unsigned commits and
   only touched one PR per push.
3. Other repositories in the account each grew their own mechanism (a signing
   key in Actions secrets, a Python lifecycle tool). One key is not registered
   to the account, so its commits show as unverified.

Commits created through the REST Git Data API are signed by GitHub when the
caller is the built-in `GITHUB_TOKEN` or a GitHub App installation token. A
personal access token does not get this.

## Decision

Rebase in the runner, then recreate each commit through the Git Data API so
GitHub signs it, and move the PR branch to the new tip. Land PRs with squash
merge (GitHub signs the squash commit) and keep linear history.

This lives in `.github/workflows/signed-rebase.yml` as a reusable workflow with
no repository-specific logic, so it can later move to the shared `.github`
repository unchanged. `pr-automation.yml` calls it on every push to `main`,
nightly, and on demand.

Rules the workflow follows:

- Skips forks, Dependabot and Renovate (they rebase their own PRs), and PRs
  labelled `do-not-rebase`. Drafts are included.
- On a conflict, merge commits, workflow-file changes the token cannot push, or
  a commit GitHub would not verify: changes nothing, labels the PR
  `needs-rebase`, and keeps one comment up to date.
- Never overwrites a branch that moved while it was rebasing.
- Rebases at most ten PRs a run.

### Stage 1: built-in token (now)

`GITHUB_TOKEN` needs no setup and no secret to rotate. Two limits come with it:

- Its pushes do not start workflows, so the job dispatches `checks.yml` on each
  rebased branch. The PR size guard runs on dispatch too and passes, because a
  rebase does not change what the PR adds.
- It cannot push branches that change files under `.github/workflows`. Those PRs
  get flagged for a manual rebase.

### Stage 2: GitHub App (when needed)

Set the `REBASE_APP_ID` variable and `REBASE_APP_PRIVATE_KEY` secret. The same
workflow then mints an App token; App pushes start workflows normally, so the
dispatch step turns itself off. No code change.

Move to stage 2 when any of these happens:

- A required check does not accept the dispatched run.
- A rebased PR sits with no checks.
- PRs that change workflow files get flagged often enough to be a chore.
- A second repository adopts this and keeping each one's token setup in step
  becomes work.

## Where the workflow lives

This is a one-time setup for a handful of personal repositories. It stays in
this repository for the canary and moves to the shared `.github` repository
once it has proved itself, with each repository keeping a small caller job.

A dedicated central or admin repository (one bot that reaches into every
repository on a schedule) is not warranted now. It would be worth it only when:

- more than about ten active repositories need the same policy, or
- repositories keep missing the caller job and drifting, or
- the policy needs credentials that no single repository should hold.

Until then, a reusable workflow plus a small caller per repository is the
smallest thing that works. We do not want to over-engineer this.

## Options considered

| Option | Signed | Setup | Why not |
| --- | --- | --- | --- |
| GitHub "Update branch" rebase | No | None | Unsigned commits, by design |
| Runner rebase pushed with a PAT | No | PAT | PAT commits are not signed by GitHub |
| Runner rebase signed with a stored SSH key | Only if the key is registered | Key per repo | Key management; the current key shows unverified |
| **Runner rebase, commits recreated via API (chosen)** | Yes | None in stage 1 | Dispatch workaround, no workflow-file PRs |
| Merge queue | Squash is signed | Paid on private repos | Doesn't keep open PRs current |

## Kill criteria

Turn the `rebase` job off and fall back to rebasing by hand if, in the first
two weeks, it lands a single unverified commit or a single wrong rebase. The
job fails loudly when GitHub does not verify a recreated commit, so the first
case shows as a red run, not a quiet one.

## Consequences

- PR authorship is kept where GitHub allows it; where it does not, the commit is
  made by the bot with a `Co-authored-by` trailer for the original author.
- The old `rebase-next` job and its `PR_QUEUE_TOKEN` use for rebasing go away.
  The `auto-merge` job stays.
