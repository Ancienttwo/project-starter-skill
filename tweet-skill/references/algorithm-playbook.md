# X Algorithm Playbook

Actionable content strategy derived from X's open-source recommendation algorithm (twitter/the-algorithm).

## How the Algorithm Scores Your Tweet

The Heavy Ranker predicts these signals simultaneously and combines them into a weighted score:

| Signal | Weight Direction | What It Means for You |
|--------|-----------------|----------------------|
| P(Like) | +++ | Make content easy to agree with — clear, quotable takeaways |
| P(Retweet) | +++ | Make content share-worthy — frameworks, lists, surprising data |
| P(Reply) | ++ | End with questions, hot takes, or "what would you add?" |
| P(Dwell Time) | ++ | Long-form threads, storytelling, dense insight = longer reads |
| P(Profile Click) | + | Strong bio + avatar; reference your expertise naturally |
| P(Negative Feedback) | --- | Avoid rage-bait, clickbait, misleading claims |
| P(Report) | --- | Stay within community guidelines, no harassment |

## The Candidate Pipeline — How You Get Surfaced

### In-Network (~50% of For You feed)
Your followers' feed. Optimize:
- Post when followers are active
- Maintain consistent posting cadence so Earlybird indexes recent content
- Engage with followers (replies boost Real-Graph affinity)

### Out-of-Network (~50% of For You feed)
Reach beyond followers via:
- **UTEG (interaction graph)**: When your followers engage, their connections see your content. Make content that compels your existing audience to interact.
- **SimClusters (community embeddings)**: Algorithm clusters you by community. Stay topically consistent to build a strong embedding. Scattered topics = weak signal.
- **Follow Recommendations**: High Tweepcred (reputation PageRank) gets you recommended. Quality followers > quantity.

## Algorithm-Aligned Content Patterns

### Thread Optimization (maximizes Dwell Time + Retweet)
- Hook tweet with bold claim or surprising number
- Each tweet is self-contained but builds on the previous one
- Use numbered format (1/N) for perceived value
- End with a summary + CTA

### Single Tweet Optimization (maximizes Like + Retweet)
- One clear insight per tweet
- Use line breaks for readability
- End with a question or actionable takeaway
- Keep under 200 characters for maximum retweet rate (or go 280 for depth)

### Engagement Patterns (maximizes Reply + Profile Click)
- "What's your experience with X?" — invites replies
- "Unpopular opinion: ..." — triggers debate
- "Most people think X. The reality is Y." — pattern interrupt
- Polls — algorithmic signal for engagement

## Timing & Cadence
- Post 2-4 times daily for optimal Earlybird indexing
- Space posts 3-4 hours apart
- Engage in replies within the first hour (boosts initial signal)
- Monday-Friday outperforms weekends for professional content

## Anti-Patterns (triggers negative signals)
- Excessive self-promotion without value
- Engagement bait ("Like if you agree")
- Posting identical content repeatedly
- Thread with no substance (padding for length)
- Screenshots of text (low dwell time, no text for indexing)
