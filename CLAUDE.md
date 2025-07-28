# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CogTest is a web-based cognitive assessment application for screening cognitive function, similar to tests used for dementia and Alzheimer's evaluation. The application includes multiple cognitive test modules (memory, attention, orientation, language, visuospatial) with Firebase authentication and data persistence.

## Architecture

### Core Components
- **index.html**: Entry point that loads Firebase SDK and all test modules
- **app.js**: Main application class (`CognitiveTestApp`) that orchestrates test execution, user management, and Firebase integration
- **auth.js**: Authentication manager (`AuthManager`) handling user registration, login, and session management
- **firebase-config.js**: Standalone Firebase configuration (currently unused - configuration is embedded in app.js and auth.js)

### Test Modules (tests/ directory)
Each test is implemented as a standalone class:
- **memoryTest.js**: `MemoryTest` - Word recall, immediate and delayed memory assessment
- **attentionTest.js**: `AttentionTest` - Digit span and concentration tasks  
- **orientationTest.js**: `OrientationTest` - Time and place awareness
- **languageTest.js**: `LanguageTest` - Naming and verbal fluency
- **visuospatialTest.js**: `VisuospatialTest` - Spatial reasoning and drawing tasks

### Data Flow
1. User authenticates via Firebase Auth
2. Test results are stored in Firestore with user ID association
3. Results are loaded on login and displayed in dashboard
4. Tests can be taken individually or as a full battery

## Firebase Configuration

The application uses Firebase for authentication and data storage. Firebase configuration is duplicated in both `app.js:24-31` and `auth.js:15-22`. When updating Firebase settings, both files must be modified.

### Required Firebase Services
- **Authentication**: Email/password sign-in
- **Firestore**: Test results storage in `testResults` collection
- **Security Rules**: Users can only access their own test data

## Development Commands

This is a vanilla JavaScript application with no build process. Development is done by:

1. **Local Development**: Open `index.html` directly in a web browser or serve via local HTTP server
2. **Testing**: Manual testing through the web interface (no automated test suite)
3. **Deployment**: Static hosting (designed for GitHub Pages)

## Key Patterns

### Test Module Interface
All test classes follow this pattern:
- `start(callback)`: Initialize and begin test
- Score calculation with `maxScore` property
- Result reporting via `window.app.saveTestResult(testType, score, details)`
- Support for both individual and battery execution

### Firebase Integration
- Dynamic imports for Firebase modules to reduce initial bundle size
- Async initialization with polling for Firebase availability
- Error handling for network/authentication failures
- Real-time auth state management

### Scoring System
- Each test calculates percentage scores based on maxScore
- Results include detailed breakdowns for clinical interpretation
- Overall performance calculated across multiple test domains

## File Structure Notes

- Root-level files support GitHub Pages deployment
- Test modules are self-contained with no cross-dependencies
- Authentication and main app logic are separated for maintainability
- No package.json - this is a pure client-side application using CDN resources