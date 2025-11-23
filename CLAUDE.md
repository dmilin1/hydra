# CLAUDE.md - Hydra Codebase Guide for AI Assistants

## Project Overview

**Hydra** is a mobile Reddit client built with React Native and Expo that doesn't require a Reddit API key. It's a well-structured, production-ready application with in-app purchases, custom theming, and comprehensive Reddit functionality.

- **Version**: 3.1.0
- **Framework**: React Native 0.81.5 + Expo 54
- **Language**: TypeScript (strict mode)
- **Platform**: iOS and Android
- **Bundle ID**: com.dmilin.hydra

## Directory Structure

```
/home/user/hydra/
├── app/                      # Expo Router entry + navigation screens
│   ├── index.tsx            # Root app wrapper with providers
│   ├── stack/               # Native Stack Navigator screens (adapters)
│   └── tabs/                # Bottom Tab Navigator (5 tabs)
├── pages/                   # Actual page implementations (business logic)
├── components/              # Reusable UI components
│   ├── RedditDataRepresentations/  # Domain components (Post, User, etc.)
│   ├── Modals/             # Modal dialogs
│   ├── UI/                 # Generic UI components
│   ├── Navbar/             # Navigation bar
│   ├── HTML/               # HTML/Markdown rendering
│   └── Other/              # Utility components
├── api/                     # Reddit API client layer
│   ├── RedditApi.ts        # Core API wrapper
│   ├── Posts.ts            # Post fetching/formatting
│   ├── PostDetail.ts       # Post details + comments
│   ├── Authentication.ts   # Auth state management
│   └── [other API modules]
├── contexts/               # React Context providers (state management)
│   ├── AccountContext.tsx
│   ├── SettingsContexts/   # Settings sub-contexts
│   │   ├── ThemeContext.tsx
│   │   └── [8 more settings contexts]
│   └── [17 total contexts]
├── db/                     # Database layer (Drizzle ORM + SQLite)
│   ├── schema.ts           # Table definitions
│   ├── index.ts            # DB initialization
│   └── functions/          # Database query functions
├── drizzle/                # Database migrations
├── utils/                  # Utility functions & custom hooks
│   ├── KeyStore.ts         # MMKV wrapper
│   ├── RedditURL.ts        # URL parsing & routing
│   └── [custom hooks]
├── constants/              # App configuration
│   ├── Themes.ts           # Theme definitions
│   └── SettingsKeys.ts     # Storage key constants
├── assets/                 # Images, fonts, icons
├── external/               # External integrations
└── [config files]
```

## Architecture Patterns

### Layered Architecture

```
┌─────────────────────────────────────────────────────┐
│ Screens (app/stack/)                                │
│ - Thin wrappers that wire pages to navigation       │
├─────────────────────────────────────────────────────┤
│ Pages (pages/)                                      │
│ - Business logic and screen implementations         │
├─────────────────────────────────────────────────────┤
│ Components (components/)                            │
│ - Reusable UI + domain-specific components          │
├─────────────────────────────────────────────────────┤
│ Context Providers (contexts/)                       │
│ - State management (17 context providers)           │
├─────────────────────────────────────────────────────┤
│ API Client (api/)                                   │
│ - Reddit API + data formatting/normalization        │
├─────────────────────────────────────────────────────┤
│ Persistence (db/ + utils/KeyStore.ts)              │
│ - SQLite (Drizzle ORM) + MMKV key-value store      │
└─────────────────────────────────────────────────────┘
```

### Key Architectural Principles

1. **Separation of Concerns**: Screens are thin adapters; business logic lives in pages/
2. **Context-Based State**: No Redux/Zustand - multiple specialized contexts
3. **Type Safety**: TypeScript strict mode, typed navigation params
4. **Theme-First**: Every component uses theme from ThemeContext
5. **URL-Based Navigation**: Navigate using Reddit URLs, not screen names

## State Management

### Context Hierarchy

The app uses a **multi-context provider architecture**. All contexts are initialized in `app/index.tsx`:

```tsx
<SafeAreaProvider>
  <AccountProvider>              // User auth + multi-account
    <SubscriptionsProvider>      // RevenueCat in-app purchases
      <SettingsProvider>         // Composed of 8 sub-providers
        <TabScrollProvider>      // Tab bar scroll animations
          <NavigationProvider>   // Startup nav state
            <InboxProvider>      // Unread messages
              <ModalProvider>    // Global modal state
                {/* ...more providers */}
                <Tabs />
              </ModalProvider>
            </InboxProvider>
          </NavigationProvider>
        </TabScrollProvider>
      </SettingsProvider>
    </SubscriptionsProvider>
  </AccountProvider>
</SafeAreaProvider>
```

### Key Contexts

| Context | Purpose | Key State |
|---------|---------|-----------|
| `AccountContext` | User authentication | `currentUser`, `accounts[]`, `logIn()`, `logOut()` |
| `ThemeContext` | Theme management | `theme`, `setTheme()`, custom themes |
| `SubscriptionsContext` | In-app purchases | `isProUser`, `offerings` |
| `InboxContext` | Inbox state | `unreadCount`, `messages[]` |
| `ModalContext` | Global modals | `modalStack[]`, `pushModal()`, `popModal()` |
| `SubredditContext` | Subscriptions | `subreddits[]`, `subscribe()`, `unsubscribe()` |
| `NavigationContext` | Nav restoration | `initialState`, saved tab/route state |

### Context Pattern

Each context follows this pattern:

```tsx
// 1. Define context type
type MyContextType = {
  value: string;
  setValue: (v: string) => void;
};

// 2. Create context
const MyContext = createContext<MyContextType | undefined>(undefined);

// 3. Provider component
export function MyProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<string>('');

  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
}

// 4. Custom hook
export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) throw new Error('useMyContext must be within MyProvider');
  return context;
}
```

## Data Persistence

### MMKV (Fast Key-Value Store)

Used for settings, preferences, and lightweight data:

```tsx
// Access via KeyStore wrapper
import { KeyStore } from '@/utils/KeyStore';

// Direct access
KeyStore.set('key', 'value');
const value = KeyStore.getString('key');
KeyStore.delete('key');

// React hooks (auto re-renders)
const [theme, setTheme] = useMMKVString('selectedTheme');
const [compactMode, setCompactMode] = useMMKVBoolean('compactMode');
```

**Common Storage Keys** (see `constants/SettingsKeys.ts`):
- User prefs: `selectedTheme`, `compactMode`, `showNSFW`
- Navigation: `INITIAL_TAB_STORAGE_KEY`, `STARTUP_URL_STORAGE_KEY`
- Feature flags: `useDifferentDarkTheme`, `hideSeenPosts`

### Drizzle ORM + SQLite

Used for structured data requiring queries:

```tsx
// Database instance
import { db } from '@/db';

// Query functions in db/functions/
import { markPostSeen, isPostSeen } from '@/db/functions/SeenPosts';
import { saveDraft, getDraft } from '@/db/functions/Drafts';
```

**Database Tables**:

| Table | Purpose | Key Operations |
|-------|---------|----------------|
| `seen_posts` | Track viewed posts | `markPostSeen()`, `isPostSeen()`, `getSeenPosts()` |
| `drafts` | Save unsent comments | `saveDraft()`, `getDraft()`, `deleteDraft()` |
| `custom_themes` | User themes | `saveCustomTheme()`, `getCustomThemes()` |
| `counter_stats` | Usage stats | `incrementCounter()`, `getCounterStats()` |
| `subreddit_visits` | Visit tracking | `incrementVisit()`, `getMostVisited()` |

**Database Patterns**:

```tsx
// Insert with conflict handling
await db.insert(SeenPosts)
  .values({ postId: post.id })
  .onConflictDoNothing();

// Query with conditions
const draft = db.select()
  .from(Drafts)
  .where(eq(Drafts.key, draftKey))
  .limit(1)
  .get();

// Pagination
const posts = db.select()
  .from(SeenPosts)
  .orderBy(desc(SeenPosts.updatedAt))
  .offset(page * 50)
  .limit(50)
  .all();
```

### When to Use What?

- **MMKV**: Settings, feature flags, simple key-value pairs
- **SQLite**: Lists, searchable data, relational data, data requiring cleanup

## Navigation & Routing

### Navigation Structure

**React Navigation** (not Expo Router at runtime):

```
Bottom Tabs (5 tabs)
├── Posts Tab
│   └── Stack Navigator
│       ├── Subreddits (root)
│       ├── Home
│       ├── PostsPage
│       ├── PostDetails
│       └── [11 more screens]
├── Inbox Tab (similar stack)
├── Account Tab (similar stack)
├── Search Tab (similar stack)
└── Settings Tab (similar stack)
```

### URL-Based Navigation

The app uses a URL-based navigation system via `RedditURL` class:

```tsx
import { useURLNavigation } from '@/utils/navigation';

const { pushURL, replaceURL } = useURLNavigation();

// Navigate by Reddit URL (auto-detects screen type)
pushURL('https://www.reddit.com/r/typescript');
pushURL('https://www.reddit.com/user/spez');
pushURL('https://www.reddit.com/r/programming/comments/abc123/title');

// Replace current screen
replaceURL('https://www.reddit.com/r/reactnative');
```

**URL Parsing** (`utils/RedditURL.ts`):

```tsx
const url = new RedditURL('https://www.reddit.com/r/typescript');
url.getPageType();    // PageType.SUBREDDIT
url.getSubreddit();   // 'typescript'
url.applyPreferredSorts(); // Apply user's preferred sort
```

### Typed Navigation

```tsx
// Navigation types defined in app/stack/index.tsx
type StackParamsList = {
  Home: { url: string };
  PostsPage: { url: string };
  PostDetails: { url: string; post?: Post };
  UserProfile: { username: string };
  // ...
};

// Usage in components
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';

type PostDetailsRouteProp = RouteProp<StackParamsList, 'PostDetails'>;
const route = useRoute<PostDetailsRouteProp>();
const { url, post } = route.params;
```

## Theme System

### Theme Structure

```tsx
// constants/Themes.ts
type Theme = {
  key: string;
  name: string;
  text: ColorValue;           // Primary text
  background: ColorValue;     // Background
  tint: ColorValue;          // Accent color
  iconPrimary: ColorValue;
  upvote: ColorValue;
  downvote: ColorValue;
  delete: ColorValue;
  reply: ColorValue;
  commentDepthColors: string[];  // Nested comment colors
  isPro: boolean;            // Paywall flag
  statusBar: StatusBarStyle;
};
```

### Available Themes

**Free Themes**: `dark`, `light`, `midnight`, `discord`, `spotify`
**Pro Themes**: `strawberry`, `spiderman`, `gilded`, `mulberry`, `ocean`, `aurora`, `royal`

### Custom Themes

Users can create custom themes (stored in database):

```tsx
type CustomTheme = Partial<Omit<Theme, 'key' | 'isPro'>> & {
  name: string;
  extends: keyof typeof Themes;  // Base theme
};
```

### Using Themes in Components

```tsx
import { useContext } from 'react';
import { ThemeContext } from '@/contexts/SettingsContexts/ThemeContext';

function MyComponent() {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={{ backgroundColor: theme.background }}>
      <Text style={{ color: theme.text }}>Content</Text>
    </View>
  );
}
```

**Important**: ALWAYS use `theme` from context, never hardcode colors.

### System Dark Mode

```tsx
// ThemeContext handles system preference
const systemColorScheme = useColorScheme(); // 'light' | 'dark'
const useDifferentDarkTheme = useMMKVBoolean('useDifferentDarkTheme');

// Auto-switches theme based on system
```

## Reddit API Integration

### API Client Structure

All Reddit API calls go through `api/RedditApi.ts`:

```tsx
import RedditAPI from '@/api/RedditApi';

// Authenticated requests
const posts = await RedditAPI.getCurrentUserInfo();
const saved = await RedditAPI.getSavedPosts();

// Unauthenticated requests (uses Apollo GraphQL endpoint)
const posts = await RedditAPI.getSubredditPosts('typescript', 'hot');
```

### Data Formatting Pattern

Raw Reddit API responses are transformed into app-specific types:

```tsx
// api/Posts.ts
export async function formatPostData(child: any): Promise<Post> {
  // Extracts: title, author, media, scores, timestamps, etc.
  // Handles: galleries, videos, crossposts, polls, embeds
  return {
    id: child.data.id,
    title: child.data.title,
    author: child.data.author,
    upvotes: child.data.ups,
    // ... normalized fields
  };
}
```

### API Modules

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| `RedditApi.ts` | Core API client | `get()`, `post()`, `getCurrentUserInfo()` |
| `Posts.ts` | Post fetching | `getSubredditPosts()`, `formatPostData()` |
| `PostDetail.ts` | Post + comments | `getPostDetail()`, `formatCommentData()` |
| `Messages.ts` | Inbox | `getMessages()`, `markRead()`, `reply()` |
| `Subreddits.ts` | Subreddit data | `getSubredditInfo()`, `subscribe()` |
| `Authentication.ts` | Auth state | `checkLoginStatus()`, `refreshToken()` |

## Development Workflows

### Running the App

```bash
# iOS (recommended for development)
SENTRY_DISABLE_AUTO_UPLOAD=true npx expo run:ios

# Android
npx expo run:android

# With cache clear
npx expo start -c
```

### Linting & Type Checking

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# TypeScript type checking
npm run tsc
```

### Database Operations

```bash
# Generate migration after schema changes
npx drizzle-kit generate

# View database in Drizzle Studio (dev builds only)
npx drizzle-kit studio
```

### Building for Production

```bash
# iOS
npx expo build:ios

# Android
npx expo build:android
```

## Code Conventions

### File Organization

1. **Screens vs Pages**:
   - `app/stack/` = thin wrappers connecting navigation to pages
   - `pages/` = actual screen implementations with business logic

2. **Component Location**:
   - Generic UI → `components/UI/`
   - Reddit-specific → `components/RedditDataRepresentations/`
   - Modals → `components/Modals/`

3. **Hooks**:
   - Place in `utils/` with `use` prefix
   - Export as named export

### Naming Conventions

- **Components**: PascalCase (e.g., `PostComponent.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useURLNavigation.ts`)
- **Contexts**: PascalCase + `Context` suffix (e.g., `ThemeContext.tsx`)
- **API modules**: PascalCase (e.g., `Posts.ts`)
- **Utils**: camelCase (e.g., `navigation.ts`)

### Component Patterns

**Prop Types**:
```tsx
type MyComponentProps = {
  data: Post;
  onPress?: () => void;  // Optional callbacks
  setData: (data: Post) => void;  // State setters
};

export default function MyComponent({
  data,
  onPress,
  setData
}: MyComponentProps) {
  // ...
}
```

**State Updates**:
```tsx
// Immutable updates for object state
const [post, setPost] = useState<Post>(initialPost);
setPost({ ...post, upvotes: post.upvotes + 1 });

// Callback pattern for dependent state
setPost(prev => ({ ...prev, saved: !prev.saved }));
```

**Styling**:
```tsx
// Always use theme from context
const { theme } = useContext(ThemeContext);

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background,
  },
  text: {
    color: theme.text,
    fontSize: 16,
  },
});
```

### TypeScript Guidelines

1. **Use strict types** - avoid `any` unless necessary
2. **Define prop types** for all components
3. **Type hook returns** explicitly
4. **Use enums** for constants (e.g., `PageType`, `SortType`)
5. **Extract types** to separate files if used in multiple places

### ESLint Rules

Key rules from `eslint.config.js`:

- `react-hooks/exhaustive-deps`: OFF (intentionally disabled)
- `@typescript-eslint/no-explicit-any`: OFF (allowed when needed)
- Unused vars: WARN (prefix with `_` to ignore)
- Prettier: enforced

## Important Patterns

### Custom Hooks

**Data Fetching Hook** (`utils/useRedditDataState.ts`):
```tsx
const {
  data,
  loading,
  error,
  loadMore,
  refresh,
  hasMore
} = useRedditDataState({
  fetchFunction: () => RedditAPI.getSubredditPosts(subreddit, sort),
  dependencies: [subreddit, sort],
});
```

**Component Actions** (`utils/useComponentActions.ts`):
```tsx
const {
  handleUpvote,
  handleDownvote,
  handleSave,
  handleShare,
  showContextMenu
} = useComponentActions(post, setPost);
```

### Pagination Pattern

Lists use `@shopify/flash-list` for performance:

```tsx
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={posts}
  renderItem={({ item }) => <PostComponent post={item} />}
  estimatedItemSize={200}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

### Modal Pattern

Global modal stack managed by `ModalContext`:

```tsx
import { useModal } from '@/contexts/ModalContext';

const { pushModal, popModal } = useModal();

// Show modal
pushModal(
  <MyModal
    onClose={popModal}
    data={data}
  />
);
```

### Gesture Actions

Posts support swipe actions via `Slideable` component:

```tsx
<Slideable
  leftActions={[
    { icon: 'arrow-up', color: theme.upvote, onPress: handleUpvote },
    { icon: 'arrow-down', color: theme.downvote, onPress: handleDownvote },
  ]}
  rightActions={[
    { icon: 'bookmark', color: theme.reply, onPress: handleSave },
  ]}
>
  <PostComponent post={post} />
</Slideable>
```

## Testing

**Current Status**: No unit tests exist

**Test Infrastructure**:
- Jest configuration present (`jest-expo` preset)
- No test files in codebase

**Quality Assurance**:
- TypeScript strict mode (compile-time checks)
- ESLint + Prettier (code quality)
- Manual testing on iOS/Android

**When Adding Tests**:
1. Place tests adjacent to source: `MyComponent.test.tsx`
2. Use `@testing-library/react-native`
3. Focus on critical paths: auth, API, navigation
4. Run with `npm test`

## Key Dependencies

### Core Framework
- `expo@54.0.0` - Managed React Native platform
- `react-native@0.81.5` - Latest stable RN
- `react@19.1.0` - React 19

### Navigation
- `@react-navigation/native@7.1.20`
- `@react-navigation/native-stack@7.6.3`
- `@react-navigation/bottom-tabs@7.8.5`

### Data & State
- `drizzle-orm@0.44.4` - SQL ORM
- `expo-sqlite@16.0.9` - SQLite driver
- `react-native-mmkv@3.3.0` - Fast key-value storage

### UI Components
- `@shopify/flash-list@2.0.2` - High-performance lists
- `expo-image@3.0.10` - Optimized image component
- `expo-video@3.0.14` - Video playback
- `react-native-webview@13.15.0` - In-app browser
- `@expo/react-native-action-sheet@4.1.1` - Action sheets

### Features
- `react-native-purchases@8.9.3` - RevenueCat (IAP)
- `expo-notifications@0.32.12` - Push notifications
- `@sentry/react-native@7.2.0` - Error tracking
- `expo-web-browser@15.0.9` - External browser

## Common Tasks for AI Assistants

### Adding a New Screen

1. Create page in `pages/`: `pages/MyNewPage.tsx`
2. Create screen wrapper in `app/stack/`: `app/stack/MyNewScreen.tsx`
3. Add route to `StackParamsList` in `app/stack/index.tsx`
4. Register screen in Stack.Navigator
5. Add to `PageType` enum in `utils/RedditURL.ts` (if URL-accessible)

### Adding a New Setting

1. Add storage key to `constants/SettingsKeys.ts`
2. Create/update context in `contexts/SettingsContexts/`
3. Add UI in `pages/SettingsPage/`
4. Use MMKV hooks: `useMMKVString()`, `useMMKVBoolean()`, etc.

### Adding a New Theme

1. Define theme in `constants/Themes.ts`
2. Set `isPro: true` if premium theme
3. Theme automatically available in ThemeContext

### Modifying Database Schema

1. Update schema in `db/schema.ts`
2. Run `npx drizzle-kit generate` (creates migration)
3. Add query functions in `db/functions/`
4. Restart app to apply migration

### Adding a Component

1. Choose location:
   - Generic UI → `components/UI/`
   - Reddit-specific → `components/RedditDataRepresentations/`
2. Use theme from `ThemeContext`
3. Define prop types
4. Export as default

## Git Workflow

### Branch Convention

Development happens on feature branches with pattern:
```
claude/claude-md-{identifier}-{session-id}
```

### Committing Changes

```bash
# Check status
git status

# Stage files
git add .

# Commit with descriptive message
git commit -m "Brief description of changes

More detailed explanation if needed"

# Push to feature branch
git push -u origin <branch-name>
```

### Pull Request Process

1. Ensure all changes are committed
2. Push to feature branch
3. Create PR via GitHub web interface
4. Include:
   - Summary of changes
   - Testing performed
   - Screenshots (if UI changes)

## Performance Considerations

### Optimization Strategies Used

1. **FlashList** instead of FlatList (10x faster)
2. **MMKV** instead of AsyncStorage (synchronous, faster)
3. **Image optimization** via `expo-image` (caching, resizing)
4. **Lazy context initialization** (avoid unnecessary providers)
5. **Memoization** for expensive computations
6. **SQLite indexes** on frequently queried columns

### Performance Anti-Patterns to Avoid

- Don't use `FlatList` - use `FlashList`
- Don't use `AsyncStorage` - use MMKV
- Don't create styles inside render - use `StyleSheet.create()`
- Don't pass inline functions to list items - memoize callbacks
- Don't fetch data in `useEffect` without cleanup

## Debugging

### Common Issues

**Build Failures**:
```bash
# Clear caches
npx expo start -c
rm -rf node_modules
npm install

# iOS pod issues
cd ios && pod install --repo-update && cd ..
```

**Database Issues**:
```bash
# View database
npx drizzle-kit studio

# Reset database (dev only)
# Delete app from device/simulator and reinstall
```

**Navigation Issues**:
- Check `StackParamsList` types match actual routes
- Verify URL parsing in `RedditURL.ts`
- Check NavigationContext for saved state conflicts

### Development Tools

- **React Native Debugger**: Chrome DevTools for RN
- **Flipper**: Mobile app debugging platform
- **Drizzle Studio**: Database inspector (`npx drizzle-kit studio`)
- **Expo Dev Client**: Custom dev builds with native modules

## Security Considerations

1. **API Keys**: No Reddit API key required (uses Apollo GraphQL)
2. **Tokens**: Stored securely in `expo-secure-store`
3. **Sensitive Data**: Never log auth tokens or user credentials
4. **Deep Links**: Validate URLs before navigation
5. **User Content**: Sanitize HTML before rendering

## Additional Resources

- **Repository**: https://github.com/dmilin1/hydra
- **Discord**: https://discord.gg/ypaD4KYJ3R
- **License**: AGPL-3.0
- **Expo Docs**: https://docs.expo.dev
- **React Navigation Docs**: https://reactnavigation.org

## Questions & Troubleshooting

When encountering issues:

1. Check recent git commits for context
2. Review relevant context providers for state
3. Check `constants/SettingsKeys.ts` for storage keys
4. Review `db/schema.ts` for data models
5. Examine `api/` modules for API patterns
6. Look at similar components for reference

---

**Last Updated**: 2025-11-23
**Expo SDK**: 54
**React Native**: 0.81.5
**TypeScript**: 5.9.2
