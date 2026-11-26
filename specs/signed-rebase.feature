Feature: Keep open PRs rebased with signed commits
  Every open PR from this repository stays rebased on the base branch, and
  every commit the automation writes is verified by GitHub.
  Decision: docs/decisions/0001-signed-auto-rebase.md

  Background:
    Given the base branch is main
    And the signed-rebase workflow runs on a push to main, nightly, or on demand

  Scenario: A behind PR is rebased and its commits are verified
    Given an open PR whose branch is behind main
    And it rebases onto main without conflicts
    When the workflow runs
    Then each commit on the PR branch is recreated on top of main
    And GitHub reports every recreated commit as verified
    And the PR branch points at the new tip
    And the original author is kept where GitHub allows it
    And otherwise the commit carries a Co-authored-by trailer for the original author

  Scenario: Required checks run on the rebased branch
    Given the workflow uses the built-in token
    When it moves a PR branch
    Then it dispatches checks.yml on that branch
    And every required check reports on the new head commit

  Scenario: Stage 2 App token needs no dispatch
    Given the REBASE_APP_ID variable and REBASE_APP_PRIVATE_KEY secret are set
    When the workflow moves a PR branch
    Then it uses the App token
    And it does not dispatch checks itself

  Scenario: A PR that is already current is left alone
    Given an open PR whose branch already contains main
    When the workflow runs
    Then the PR branch is unchanged
    And any needs-rebase label is removed

  Scenario Outline: The workflow refuses to guess
    Given an open PR where <condition>
    When the workflow runs
    Then the PR branch is unchanged
    And the PR is labelled needs-rebase
    And one comment on the PR says why

    Examples:
      | condition                                          |
      | the rebase conflicts with main                     |
      | the branch contains merge commits                  |
      | the PR changes workflow files the token can't push |
      | GitHub does not verify a recreated commit          |

  Scenario Outline: Some PRs are never touched
    Given an open PR that <kind>
    When the workflow runs
    Then the PR branch is unchanged

    Examples:
      | kind                            |
      | comes from a fork               |
      | was opened by Dependabot        |
      | was opened by Renovate          |
      | is labelled do-not-rebase       |

  Scenario: Work pushed during a rebase wins
    Given the workflow is rebasing a PR
    When someone pushes to that PR branch before the workflow moves it
    Then the workflow does not move the branch

  Scenario: An unverified commit fails the run
    Given GitHub does not verify a recreated commit in either authorship mode
    When the workflow finishes
    Then the run fails
    And no branch was changed for that PR
