# Development Workflow

Complete development workflow for the Car Sound Changer project.

## Overview

This document outlines the development process, branching strategy, code review process, and release workflow.

## Development Process

```
┌──────────────┐
│ Requirements │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Design    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Implementation│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Testing    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Code Review   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Merge     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Release    │
└──────────────┘
```

## Git Workflow

### Branch Strategy

```
main (production)
├── develop (integration)
│   ├── feature/gps-integration
│   ├── feature/bluetooth-audio
│   ├── feature/nfs-sounds
│   ├── feature/ui-gauges
│   ├── bugfix/audio-lag
│   └── hotfix/crash-on-startup
```

### Branch Naming Convention

- `feature/<feature-name>` - New features
- `bugfix/<bug-description>` - Bug fixes
- `hotfix/<critical-fix>` - Production hotfixes
- `refactor/<what-refactoring>` - Code refactoring
- `docs/<doc-update>` - Documentation updates
- `test/<test-addition>` - Test additions

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(audio): add NFS-style engine sounds

Implemented dynamic engine sound system with:
- 5 gear-specific sound loops
- Pitch shifting based on RPM
- Turbo layer for high RPM
- Shift sound effects

Closes #23

---

fix(gps): improve speed calculation accuracy

Fixed GPS speed jitter by implementing Kalman filter
and moving average smoothing.

Fixes #45

---

docs(readme): update installation instructions

Added Android SDK requirements and Bluetooth permissions.
```

## Development Cycle

### 1. Feature Development

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Make changes
# ... code ...

# Commit frequently
git add .
git commit -m "feat(scope): description"

# Keep updated with develop
git fetch origin
git rebase origin/develop

# Push to remote
git push origin feature/my-feature
```

### 2. Pull Request Process

#### Before Creating PR

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Code follows style guide (see [DEV_RULES.md](./DEV_RULES.md))
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] TypeScript types defined

#### Creating PR

1. Go to GitHub/GitLab
2. Create Pull Request from `feature/x` to `develop`
3. Fill in PR template:

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Closes #123

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Tested on physical device
- [ ] Tested on emulator

## Screenshots (if UI changes)

[Add screenshots]

## Checklist

- [ ] Code follows style guide
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No breaking changes (or documented)
```

#### PR Review Process

1. **Automated Checks** (CI/CD):
   - Lint check
   - Type check
   - Unit tests
   - Build succeeds

2. **Code Review** (1-2 reviewers):
   - Code quality
   - Architecture adherence
   - Performance considerations
   - Security review

3. **Testing**:
   - Functional testing
   - Edge cases
   - Performance testing

4. **Approval & Merge**:
   - 2 approvals required
   - Squash and merge to develop

### 3. Code Review Guidelines

#### As Reviewer

**Check for:**

- [ ] Code correctness
- [ ] Follows [DEV_RULES.md](./DEV_RULES.md)
- [ ] Proper error handling
- [ ] Performance implications
- [ ] Security concerns
- [ ] Tests cover new code
- [ ] Documentation is clear

**Review Priorities:**

1. ⚠️ **Critical**: Security, crashes, data loss
2. 🔴 **High**: Bugs, performance issues
3. 🟡 **Medium**: Code quality, readability
4. 🟢 **Low**: Style, minor improvements

**Feedback Format:**

```markdown
**[Priority] [Type]**: Description

Example:
**[High] [Bug]**: This will cause a crash when Bluetooth disconnects
**[Medium] [Style]**: Consider extracting this into a separate function
**[Low] [Suggestion]**: Could use optional chaining here
```

#### As Author

- Respond to all comments
- Ask for clarification if needed
- Make requested changes
- Mark conversations as resolved
- Be open to feedback

### 4. Testing Workflow

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- AudioService

# Run with coverage
npm test -- --coverage

# Run on device
npm run android

# Run linter
npm run lint

# Type check
npm run type-check
```

### Test Requirements

| Change Type | Required Tests      |
| ----------- | ------------------- |
| New Feature | Unit + Integration  |
| Bug Fix     | Regression test     |
| Refactor    | Existing tests pass |
| UI Change   | Manual + Screenshot |
| API Change  | API tests           |

## Release Workflow

### Version Numbering

**Semantic Versioning**: `MAJOR.MINOR.PATCH`

- `MAJOR`: Breaking changes
- `MINOR`: New features (backward compatible)
- `PATCH`: Bug fixes

**Examples:**

- `1.0.0` → `1.0.1` (bug fix)
- `1.0.1` → `1.1.0` (new feature)
- `1.1.0` → `2.0.0` (breaking change)

### Release Process

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.1.0

# 2. Update version numbers
# - package.json
# - android/app/build.gradle (versionCode, versionName)

# 3. Update CHANGELOG.md
# Add all changes since last release

# 4. Final testing
npm test
npm run android
# Test on multiple devices

# 5. Create release commit
git add .
git commit -m "chore: release v1.1.0"

# 6. Merge to main
git checkout main
git merge release/v1.1.0

# 7. Tag release
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin main --tags

# 8. Merge back to develop
git checkout develop
git merge release/v1.1.0
git push origin develop

# 9. Build release APK
cd android
./gradlew assembleRelease

# 10. Upload to Play Store / Distribute
```

### Release Checklist

- [ ] All tests pass
- [ ] Version numbers updated
- [ ] CHANGELOG.md updated
- [ ] Documentation updated
- [ ] Release notes written
- [ ] Tested on min/max Android versions
- [ ] Tested on physical devices
- [ ] GPS accuracy verified
- [ ] Bluetooth audio tested
- [ ] Performance profiled
- [ ] APK signed
- [ ] Play Store assets ready

## Continuous Integration

### CI Pipeline (GitHub Actions / GitLab CI)

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm install
      - run: npm run lint
      - run: npm run type-check
      - run: npm test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
        with:
          java-version: "17"
      - run: npm install
      - run: cd android && ./gradlew assembleDebug
```

## Development Tools

### Required Tools

- **IDE**: Visual Studio Code / Android Studio
- **Node**: v18+
- **Java**: JDK 17
- **Android SDK**: API 24-34
- **Git**: Latest version

### VS Code Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- React Native Tools
- GitLens
- TODO Highlight

### Android Studio Setup

- Android SDK Manager
- AVD Manager (Emulator)
- Logcat (for debugging)

## Daily Development Checklist

### Morning

- [ ] Pull latest develop branch
- [ ] Check CI/CD status
- [ ] Review assigned PRs
- [ ] Check task board (See [TASKS.md](./TASKS.md))

### During Development

- [ ] Write tests for new code
- [ ] Run tests frequently
- [ ] Commit small, logical changes
- [ ] Push to remote regularly
- [ ] Update documentation

### Before Committing

- [ ] Run `npm run lint`
- [ ] Run `npm test`
- [ ] Run `npm run type-check`
- [ ] Review your changes (git diff)
- [ ] Remove debug code
- [ ] Update relevant docs

### End of Day

- [ ] Push all commits
- [ ] Update task status
- [ ] Document blockers
- [ ] Plan tomorrow's work

## Troubleshooting Development Issues

### Build Issues

```bash
# Clean everything
rm -rf node_modules
npm install
cd android && ./gradlew clean && cd ..
npm start -- --reset-cache
```

### Metro Bundler Issues

```bash
# Kill Metro
npx react-native stop
# Clear cache
npx react-native start --reset-cache
```

### Android Build Issues

```bash
cd android
./gradlew clean
./gradlew assembleDebug --info
cd ..
```

## Related Documentation

- [DEV_RULES.md](./DEV_RULES.md) - Coding standards and rules
- [TASKS.md](./TASKS.md) - Current task list and priorities
- [TESTING.md](./TESTING.md) - Testing guidelines
- [CONTRIBUTING.md](../CONTRIBUTING.md) - How to contribute
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

---

**Questions?** See [FAQ.md](./FAQ.md) or ask in team chat.
