---
name: tweet-skill
description: Generate algorithm-optimized X/Twitter content — threads, single tweets, engagement posts, and weekly content calendars. Bilingual (EN/CN). Use when the user asks to write tweets, create Twitter/X content, plan a content calendar, draft a thread, generate post ideas, or says /tweet. Covers AI/tech, product/startup, and general knowledge topics.
---

# Tweet Skill

Generate high-performing X/Twitter content optimized for the recommendation algorithm. Output bilingual (EN/CN) content across threads, single tweets, and engagement posts.

## Workflow

1. Determine output type:
   - **"Write a tweet" / single topic** → Single Tweet workflow
   - **"Write a thread" / deep topic** → Thread workflow
   - **"Content calendar" / "plan this week"** → Calendar workflow
   - **"Today's tweets" / daily request** → Daily Mix workflow

2. Read `references/algorithm-playbook.md` for algorithm scoring signals
3. Read `references/tweet-templates.md` for format templates
4. Generate content following the chosen workflow below

## Single Tweet Workflow

Generate 3 variants optimized for different algorithm signals:

**Variant A — Insight (optimizes Like + Retweet):**
One clear, quotable insight. Use line breaks. End with actionable takeaway.

**Variant B — Hot Take (optimizes Reply + Dwell Time):**
Bold opinion with reasoning. Triggers discussion.

**Variant C — Question (optimizes Reply + Profile Click):**
Specific question to the audience. Invites personal answers.

Output format per variant:
```
### Variant [A/B/C] — [Signal Target]

**EN:**
[tweet text]

**CN:**
[tweet text]

Algorithm notes: [why this format works — 1 line]
```

## Thread Workflow

Structure:
1. **Hook tweet** — Bold claim, surprising number, or contrarian take (this tweet alone determines reach)
2. **Body tweets** (5-12) — One insight per tweet, each self-contained but building on the narrative
3. **Summary tweet** — Recap key points with → bullets
4. **CTA tweet** — Follow / repost call with value promise

Rules:
- Number each tweet (1/N format)
- First tweet must be under 200 characters for maximum retweet
- Include at least one concrete example, number, or case study
- Alternate between EN and CN paragraphs within each tweet, or produce full EN + full CN versions

## Calendar Workflow

Generate a 7-day content plan:

| Day | Theme | Format | Language | Topic Suggestion |
|-----|-------|--------|----------|-----------------|
| Mon | Industry trend | Thread 5-8 | EN | [specific topic] |
| Tue | Product thinking | Single + engagement | CN | [specific topic] |
| Wed | Technical deep-dive | Thread 8-12 | EN | [specific topic] |
| Thu | Personal story | Story thread or single | CN | [specific topic] |
| Fri | Curated resources | List tweet | Bilingual | [specific topic] |
| Sat | Hot take | Single tweet | Flexible | [specific topic] |
| Sun | Week reflection | Thread 3-5 | Flexible | [specific topic] |

For each day, provide:
- A headline/hook draft
- 2-3 bullet points for the body content
- Suggested posting time window

## Daily Mix Workflow

Generate a full day's content batch:
1. **Morning tweet** (8-9am) — Insight or framework (single)
2. **Midday thread** (12-1pm) — Deep-dive on the day's theme (thread)
3. **Evening engagement** (6-7pm) — Question or hot take (single)

## Algorithm Guardrails

Apply these checks to ALL generated content:

**Maximize:**
- Dwell time — dense insight, storytelling, numbered lists
- Retweet — frameworks, surprising data, share-worthy takeaways
- Reply — open questions, debatable takes, "what's yours?"
- Profile click — reference expertise naturally, strong POV

**Avoid (triggers negative signals):**
- Engagement bait ("Like if you agree", "RT to win")
- Empty padding in threads (every tweet must carry value)
- Screenshots of text (no text for algorithm indexing)
- Excessive self-promotion without insight

## Topic Domains

Content covers these areas (blend as appropriate):
- **AI / Tech** — models, tools, infrastructure, developer experience
- **Product / Startup** — product thinking, GTM, metrics, fundraising
- **General Knowledge** — mental models, frameworks, cross-domain insights

## Resources

- **Algorithm strategy**: See `references/algorithm-playbook.md` — detailed breakdown of how X's ranking signals map to content tactics
- **Templates & examples**: See `references/tweet-templates.md` — copy-ready templates for every tweet format with EN/CN examples
