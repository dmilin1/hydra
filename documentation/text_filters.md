===METADATA===
title: Text Filters
description: Text-based filtering, keyword lists, how text filtering works, and creating effective filters
===END METADATA===

# Text Filters

Text filters hide posts and comments that contain specific words or phrases. Filters are case-insensitive and use whole-word matching—for example, "cat" will match "cat" but not "caterpillar". Multi-word phrases are matched exactly as entered.

## Setting Up Text Filters

Go to [Filters settings](hydra://settings/general/filters) and find the **Text Filter List** section. Enter keywords or phrases, separated by commas or newlines. Changes save automatically.

Example filter list:
```
politics
trump
biden
spoiler
```

Or comma-separated: `politics, trump, biden, spoiler`

## What Gets Checked

For posts, text filters check the title, body text, author username, poll options, link titles, and link descriptions. For comments, they check the comment text and author username.

## Where Filters Apply

Text filters apply to posts and comments in all feeds, including the home feed, subreddit pages, multireddits, and gallery mode. They do not apply to search results or user profiles.

Heavy filtering may result in slower load times, as more items need to be fetched to fill your feed.

## Limitations

Text filters use literal matching only. They cannot match partial words, understand context or sentiment, or use complex logic like AND/OR combinations. For smarter content filtering, try [AI Filters](hydra://settings/guide/?doc=ai_filters) (Pro feature).

## Troubleshooting

If filters aren't working, check your spelling and make sure you're using whole words. Pull down to refresh your feed after making changes. Remember that filters don't apply to search results or user profiles.

---

Learn about [AI Filters](hydra://settings/guide/?doc=ai_filters) for smarter filtering, or configure filters in [Filters settings](hydra://settings/general/filters).
