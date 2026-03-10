# Android Fork Backlog

This file tracks Android-specific product and engineering priorities for the fork.
It is intentionally separate from `todo.txt`, which reflects the upstream Hydra backlog.

## Now

- [ ] Get polls working
- [ ] Sync vote state between post details and post lists
- [ ] Enable landscape mode in the internal browser
- [ ] Add an Android accessibility baseline
- [ ] Add scalable text size options
- [ ] Allow copying text from comments
- [ ] Improve visual highlighting for OP in comments
- [ ] Fix giant emoji rendering in comments

## Next

- [ ] Allow favoriting subreddits without being subscribed
- [ ] Add search history
- [ ] Allow manual subreddit open when search misses a subreddit
- [ ] Add an option to hide or lock the jump button
- [ ] Add swipe between posts
- [ ] Add an option to move thumbnails and vote controls to the right side
- [ ] Load favicons when sites do not expose Open Graph metadata
- [ ] Show author age in comments
- [ ] Add search for saved items via a local index
- [ ] Add endpoint caching and navigation stack state caching

## Later

- [ ] Add offline reading for text posts
- [ ] Save posts and comments as images
- [ ] Add auto-translation for posts and comments
- [ ] Bring chat back if it is still feasible
- [ ] Add native handling for more external media sources such as Imgur albums
- [ ] Improve tablet and multi-pane Android layouts
- [ ] Investigate missing Google sign-in on Android if it still reproduces

## Notes

- `Android support` is no longer treated as a single todo item. It is the active scope of this fork.
- Priorities should favor stability, navigation quality, media behavior, and account/core Reddit flows before nice-to-have features.
- Discord feature-request exports are useful input, but this file should stay curated rather than becoming a raw request dump.
- The Discord thread also surfaced a Reddit trademark complaint around app naming, which is another reason to keep future public fork branding separate from upstream Hydra branding.
