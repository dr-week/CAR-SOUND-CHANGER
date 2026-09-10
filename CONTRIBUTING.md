# Contributing to Car Sound Changer

Thank you for your interest in contributing! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Prioritize safety (this runs while driving)

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/carSOUNDMOD.git
cd carSOUNDMOD
```

### 2. Install Dependencies

Follow the [INSTALLATION.md](./INSTALLATION.md) guide to set up your environment.

```bash
npm install
cd android && ./gradlew clean && cd ..
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming:
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `docs/doc-update` - Documentation
- `refactor/what-refactoring` - Code refactoring

## Development Process

### 1. Pick a Task

- Check [TASKS.md](./docs/TASKS.md) for available tasks
- Comment on the task to claim it
- Understand requirements before starting

### 2. Follow Standards

Read these documents:
- [DEV_RULES.md](./docs/DEV_RULES.md) - Coding standards
- [MODULAR_STRUCTURE.md](./docs/MODULAR_STRUCTURE.md) - Code organization
- [CODE_DIVISION_RULES.md](./docs/CODE_DIVISION_RULES.md) - How to divide code
- [DEV_WORKFLOW.md](./docs/DEV_WORKFLOW.md) - Development workflow

### 3. Write Tests

All new code must include tests:
- **Components**: Component tests
- **Services**: Unit tests
- **Hooks**: Hook tests
- **Utils**: Function tests

See [TESTING.md](./docs/TESTING.md) for guidelines.

### 4. Update Documentation

If your change affects:
- **API**: Update [API_REFERENCE.md](./docs/API_REFERENCE.md)
- **Architecture**: Update [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **User-facing features**: Update [README.md](./README.md)
- **Configuration**: Update [CONFIGURATION.md](./docs/CONFIGURATION.md)

## Coding Standards

### TypeScript

```typescript
// ✅ GOOD
interface VehicleState {
  speed: number;
  gear: number;
  rpm: number;
}

function calculateGear(speed: number): number {
  // Implementation
}

// ❌ BAD
function calculateGear(speed) {  // No type
  // Implementation
}
```

### Component Structure

```typescript
// ✅ GOOD: Clean component
import React from 'react';
import { View, Text } from 'react-native';
import { useVehicleState } from '@/modules/vehicle';
import styles from './styles';

interface GearIndicatorProps {
  speed: number;
}

export const GearIndicator: React.FC<GearIndicatorProps> = ({ speed }) => {
  const { gear } = useVehicleState(speed);
  
  return (
    <View style={styles.container}>
      <Text style={styles.gear}>{gear}</Text>
    </View>
  );
};
```

### File Organization

```
module-name/
├── components/
├── hooks/
├── services/
├── types/
├── utils/
└── index.ts  # Public API
```

See [MODULAR_STRUCTURE.md](./docs/MODULAR_STRUCTURE.md) for details.

## Submitting Changes

### 1. Before Committing

```bash
# Run linter
npm run lint

# Run type check
npm run type-check

# Run tests
npm test

# Build
npm run android
```

### 2. Commit Your Changes

Use conventional commits:

```bash
git add .
git commit -m "feat(audio): add turbo sound layer

Implemented turbo spool sound that plays above 1500 RPM
with volume based on RPM level.

Closes #45"
```

**Commit types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### 3. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 4. Create Pull Request

1. Go to GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
- [ ] Unit tests pass
- [ ] Tested on physical device
- [ ] Tested with Bluetooth speaker

## Screenshots (if UI changes)
[Add screenshots]

## Checklist
- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

### 5. Code Review

- Respond to feedback promptly
- Make requested changes
- Push updates to the same branch
- Be open to suggestions

### 6. After Approval

Your PR will be merged by maintainers. Thank you!

## Reporting Bugs

### Before Reporting

1. Check [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
2. Search existing issues
3. Try latest version

### Bug Report Template

```markdown
**Describe the Bug**
Clear description of what happened

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- Device: [e.g. Samsung Galaxy S21]
- Android Version: [e.g. 12]
- App Version: [e.g. 1.0.0]
- Bluetooth Device: [if relevant]

**Additional Context**
Any other information
```

## Suggesting Features

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Problem it Solves**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other ways to solve this

**Additional Context**
Mockups, examples, etc.
```

## Development Setup

### Recommended Tools

- **IDE**: Visual Studio Code
- **Node**: v18+
- **Java**: JDK 17
- **Android Studio**: Latest

### VS Code Extensions

- ESLint
- Prettier
- TypeScript and JavaScript
- React Native Tools
- GitLens

## Getting Help

- Read documentation in `/docs`
- Check [FAQ.md](./docs/FAQ.md)
- Ask in discussions
- Contact maintainers

## Recognition

Contributors will be:
- Listed in README
- Mentioned in release notes
- Credited in commits

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Quick Reference

| Task | Command |
|------|---------|
| Install | `npm install` |
| Run | `npm run android` |
| Test | `npm test` |
| Lint | `npm run lint` |
| Type Check | `npm run type-check` |
| Format | `npm run format` |

## Related Documentation

- [DEV_WORKFLOW.md](./docs/DEV_WORKFLOW.md) - Detailed workflow
- [DEV_RULES.md](./docs/DEV_RULES.md) - Coding standards
- [TESTING.md](./docs/TESTING.md) - Testing guide
- [TASKS.md](./docs/TASKS.md) - Available tasks

---

**Thank you for contributing to Car Sound Changer!** 🚗🔊
