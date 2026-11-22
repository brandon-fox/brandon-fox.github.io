---
title: Write the invariant before the code
description: Why every rule I care about gets a check before it gets a line of code, and what that costs.
date: 2026-11-05
draft: true
---

Most engineering rules are hopes. "We sign our commits." "The README is up to date." "Every script is executable." Each is true until the day it isn't, and nobody notices on that day, because the rule lived in a document or in someone's head rather than in the path a change takes to production.

I have come to think the rule is not real until something fails when it is broken. That is the whole of what I call Axiom-Driven Engineering, and it fits in a sentence: write down what must never break, give each rule a check, run the check on every commit.

## What counts as an axiom

An axiom here is not a value or a principle. It is a sentence that can be false, paired with a check that returns false when it is. "Commits are signed" is an axiom because `git cat-file commit <sha>` either shows a signature header or it doesn't. "We care about quality" is not, because there is no commit on which it fails.

The test for a candidate rule is the same test a scientist applies to a hypothesis: what observation would prove it wrong? If I cannot name the observation, the rule is a hope, and I either sharpen it until I can or I drop it.

This is why I keep the set small. My current set has nine. They are mostly boring: required files exist, shell scripts have a shebang and are executable as committed, workflow YAML parses, no conflict markers survive a merge, commits are signed, the license is in my name and the README says the work is independent, the README's first line says what the project is and a status line follows within ten lines. Nothing clever. The point is not that these nine are the right nine. The point is that every one of them is enforced on every pull request across every repository I own, by one workflow step, and that the enforcement is itself public.

## One axiom, end to end

Take the dullest one: every shell script under `scripts/` is executable as committed. The sentence is A3 in [AXIOMS.md](https://github.com/First-ADE/.github/blob/main/AXIOMS.md). The check is a short loop in bash: for each `scripts/*.sh`, ask `git ls-files -s` for the file's mode, pass on `100755`, fail on anything else. It reads the git index rather than the working tree, because the working tree is what my machine says and the index is what everyone else will get.

It has failed. In May 2026 [a pull request](https://github.com/First-ADE/.github/pull/19) added a script without the bit set. The check said so, and the pull request merged anyway, because nothing yet required the check to pass. [The fix](https://github.com/First-ADE/.github/pull/20) landed five minutes later and did two things: it set the bit, and it added A5, which says CI must pass before merge and is enforced by branch protection rather than by the script. A3 had caught the mistake. What was missing was a rule that made the catch binding.

That is the pattern I want to show. The axiom is one sentence. The check is small and boring. The failure is real and dated, and the response to it is not a note to be more careful but another axiom. Every link in that chain is in a public repository, so you can check my account of it against the commits.

## Spec before code

The same idea, one level up, is why I write the specification before the implementation. The spec is the truth; the code is an attempt to reproduce it. When they disagree, the first question is whether the spec is wrong, and only then whether the code is.

Working this way produces an uncomfortable artifact: a traceability table that says which parts of the spec the code has actually caught up to. In my agent runtime, that table currently says that most of the specifications have no matching acceptance test yet. I publish the table anyway. A gap you can see is a plan. A gap you cannot see is a surprise, and surprises are what the whole method exists to remove.

## What it costs

Enforcement is not free, and I think the honest version of this essay has to say what it costs.

It costs friction on every change. A pull request that would have merged in a minute now waits for the axiom job. When I rename a script and forget the executable bit, the build fails, and for a moment the rule feels like bureaucracy.

It costs upkeep. The validator is code, and code rots. When I added two axioms this month, I had to change the validator, the document that lists the axioms, the composite action that runs it, and the pinned commit in every repository that consumes it. A rule you enforce is a rule you maintain.

It costs honesty. The status line axiom means every README has to say, within ten lines, whether the thing works. Several of mine now say "design record, never launched" or "spec ahead of code". That is less flattering than silence. It is also the only version of the README I can defend.

## What it does not solve

A passing axiom job does not mean the software is correct. It means a specific, small, enumerated set of things are not wrong. The method's value is exactly proportional to how good the set is, and the set is only ever as good as the last time I asked what else should never break.

It also does not replace judgment. The axioms catch the mistakes I have already decided I will not tolerate. The mistakes I have not yet imagined still get through, as they do everywhere. The difference is that when one does, the fix is not "be more careful next time". The fix is a tenth axiom.

## The one habit

If you take one thing from this: the next time you write a rule in a document, ask what would fail if it were broken. If the answer is "nothing", you have not written a rule yet.

I keep mine, with their checks, at [First-ADE](https://github.com/brandon-fox/first-ade). Every one of them has failed on me at least once. That is how I know they are real.
