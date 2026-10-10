# Android React Native Migration Plan

## Objective

Migrate the Android app from Flutter to React Native in controlled phases while preserving Firebase-backed data and existing user workflows. Keep the Flutter app as the production implementation until React Native feature parity, Android validation, and rollout readiness are demonstrated.

## Architecture Findings

- Flutter startup initializes Firebase and local notifications, then routes between login and the authenticated home screen (`lib/main.dart`).
- Authentication uses Firebase Auth with email/password and Google Sign-In (`lib/services/auth_service.dart`).
- User-scoped Firestore collections hold projects, tasks, and Pomodoro sessions (`lib/services/firestore_service.dart`). Task recurrence and priority calculation are domain logic and should be migrated separately from UI (`lib/models/task.dart`, `lib/services/recurrence_service.dart`).
- Scheduler, voice input, local notifications, and home-screen widgets depend on native/plugin integrations and need explicit React Native equivalents (`lib/services/scheduler_service.dart`, `lib/services/voice_service.dart`, `lib/services/notification_service.dart`, `lib/services/widget_service.dart`).
- The existing `react-native/` directory contained a lockfile and installed dependencies but no app source, manifest, or Android project. Its lockfile already describes React Native 0.84, TypeScript, Firebase, and navigation dependencies.
- The Graphify skill/CLI is not installed in this environment. The maintained architecture map at `graphify-out/taskwise-architecture.mmd` was updated directly from the source and manifests to record runtime flows, backend dependencies, migration boundaries, and deferred implementation decisions.

## Phases

| Phase | Scope | Exit criteria |
|---|---|---|
| 1. Android foundation (completed) | Add the official React Native Android project scaffold, TypeScript entry point, package scripts, a smoke test, and this migration plan. Do not port business behavior or switch production users. | RN project configuration and Android Gradle project are present; app code typechecks and smoke test passes. |
| 2. Firebase and authentication | Configure Android Firebase using environment-specific native config; initialize RN Firebase; port auth state, email/password, Google Sign-In, and logout. | Debug Android build succeeds with local config; auth flows and signed-in/out routing verified on device/emulator. |
| 3. Core domain and persistence | Port task, project, recurrence, and Pomodoro data contracts; implement user-scoped Firestore subscriptions and writes; add parity tests for serialization and recurrence. | Existing Firestore documents round-trip without schema changes; task/project CRUD and recurrence behavior pass tests. |
| 4. Primary workflows | Implement home/task management, project management, scheduling, Pomodoro timer/report, and settings. Preserve sorting, filtering, recurrence, and focus metrics. | Each workflow has focused tests and is verified on Android against the Flutter behavior. |
| 5. Native integrations and release | Replace notifications, voice/TTS, and home widgets with suitable RN/native integrations; verify permissions, lifecycle behavior, performance, accessibility, and release signing. | Release build and regression checklist pass; rollout/cutover approved before retiring Flutter Android entry point. |

## Phase 1 Completion Record

**Status: Complete**

Delivered an official React Native 0.84 Android host at `react-native/android` (`applicationId` and namespace `com.taskwise`), a TypeScript app entry screen, npm scripts and lockfile, Jest smoke test, and source-control rules for dependencies/build output. The Flutter Android app remains unchanged and is still the production implementation.

| Verification | Result |
|---|---|
| `npm ci` | Passed using the existing lockfile. |
| `npm test -- --runInBand` | Passed: 1 suite, 1 test. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| `npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output /tmp/taskwise.android.bundle --assets-dest /tmp/taskwise-android-assets` | Passed; Metro generated the Android JavaScript bundle. |
| `npx react-native config` | Passed; resolved Android package `com.taskwise` and native Firebase/safe-area/screens dependencies. |
| Android Gradle debug build / device launch | Not run: no Android SDK is configured in this environment. Native APK compilation and runtime remain unverified. |

The Phase 1 exit criteria in the phase table are met: the project configuration and Android host are present, and the app smoke test and typecheck pass. Native compilation is tracked as an environment limitation, not as verified behavior.

## Phase 1 File Overviews

### `graphify-out/taskwise-architecture.mmd`

## Objective

Maintain a graph of the current Flutter runtime, Firebase dependencies, and the React Native migration boundary.

## changelog table

| # | date | details | reasoning | reference |
|---|---|---|---|---|
| 1 | 2026-10-10 | Added Flutter startup/auth/data/native-service relationships and the Phase 1 RN Android boundary with future parity links. | Keeps architecture knowledge connected to the implementation while the two app shells coexist. | `lib/main.dart`; `lib/services/`; `react-native/App.tsx` |

## Results/Takeaways

Flutter remains the production implementation. React Native Phase 1 is an Android foundation only; later phases must preserve Firestore paths and behavior before cutover.

### `react-native/package.json`

## Objective

Declare the RN app scripts, runtime dependencies, and supported Node version using the versions already represented by the existing lockfile.

## changelog table

| # | date | details | reasoning | reference |
|---|---|---|---|---|
| 1 | 2026-10-10 | Added a private React Native manifest with Android, Metro, lint, typecheck, and Jest scripts. | Makes the previously lockfile-only directory a usable project without introducing a second dependency baseline. | `react-native/package-lock.json` |

## Results/Takeaways

The app has explicit setup and validation commands. Firebase and navigation dependencies are present for later phases but are not activated in Phase 1.

### `react-native/package-lock.json`

## Objective

Pin the React Native dependency graph for reproducible local and CI installs.

## changelog table

| # | date | details | reasoning | reference |
|---|---|---|---|---|
| 1 | 2026-10-10 | Added the pre-existing npm lockfile to version control without regenerating its dependency resolutions. | The new manifest matches the lockfile's declared dependency versions; `npm ci` confirms they install together. | `react-native/package.json` |

## Results/Takeaways

`npm ci` provides a repeatable setup. The lockfile is retained unchanged from the existing migration directory.

### `react-native/App.tsx`

## Objective

Provide a minimal, branded React Native entry screen showing that the Android shell is running.

## changelog table

| # | date | details | reasoning | reference |
|---|---|---|---|---|
| 1 | 2026-10-10 | Replaced the template demo screen with a safe-area-aware TaskWise foundation screen. | Establishes the app entry point without duplicating Flutter task, auth, or persistence behavior. | `lib/main.dart` |

## Results/Takeaways

The initial RN screen is intentionally a foundation state; feature screens arrive in subsequent phases.

### `react-native/__tests__/App.test.tsx`

## Objective

Smoke-test the React Native app entry screen.

## changelog table

| # | date | details | reasoning | reference |
|---|---|---|---|---|
| 1 | 2026-10-10 | Asserted that the foundation screen and phase marker render. | Gives Phase 1 a cheap regression check independent of Android SDK availability. | `react-native/App.tsx` |

## Results/Takeaways

The test validates the visible app-shell contract without coupling to layout details.

### `react-native/android/`

## Objective

Create the Android native host and Gradle wiring for React Native 0.84.

## changelog table

| # | date | details | reasoning | reference |
|---|---|---|---|---|
| 1 | 2026-10-10 | Integrated the official React Native Android template with application ID `com.taskwise`. | Ensures native build configuration comes from the supported template rather than handwritten partial Gradle setup. | React Native Community CLI template 0.84.0 |

## Results/Takeaways

The Android project is isolated under `react-native/android`; Flutter's Android project remains untouched. Local Firebase config and production signing are intentionally not included.

### `react-native/app.json`, `react-native/index.js`, `react-native/babel.config.js`, `react-native/metro.config.js`, `react-native/tsconfig.json`, `react-native/jest.config.js`, `react-native/.eslintrc.js`, `react-native/.prettierrc.js`, `react-native/.watchmanconfig`

## Objective

Provide the standard RN app registration and JavaScript/TypeScript tooling configuration.

## changelog table

| # | date | details | reasoning | reference |
|---|---|---|---|---|
| 1 | 2026-10-10 | Integrated matching React Native 0.84 template configuration files. | Keeps Metro, Babel, TypeScript, lint, and Jest aligned with the generated Android host. | React Native Community CLI template 0.84.0 |

## Results/Takeaways

Configuration follows the official template baseline; application behavior remains in typed app source.

### `.gitignore` and `react-native/.gitignore`

## Objective

Keep React Native dependencies and generated Android build files out of source control while retaining the debug keystore required for local builds.

## changelog table

| # | date | details | reasoning | reference |
|---|---|---|---|---|
| 1 | 2026-10-10 | Added RN dependency/build ignores and an exception for the generated Android debug keystore. | The repository-level ignore rules did not exclude `node_modules` and globally ignored keystores. | React Native Community CLI template `.gitignore` |
| 2 | 2026-10-10 | Allowed only `graphify-out/taskwise-architecture.mmd` through the Graphify output ignore rule. | Preserve the maintained architecture graph while keeping other generated Graphify artifacts ignored. | `graphify-out/taskwise-architecture.mmd` |

## Results/Takeaways

The RN install stays local and debug Android builds retain their template signing key; release credentials remain excluded.

### `plan.md`

## Objective

Track the Android migration sequence, architecture boundaries, and Phase 1 file decisions.

## changelog table

| # | date | details | reasoning | reference |
|---|---|---|---|---|
| 1 | 2026-10-10 | Added architecture findings, five migration phases, per-file Phase 1 overviews, and explicit Phase 1 completion evidence. | Makes scope, verified exit criteria, and the Android SDK limitation auditable before feature migration. | Flutter `lib/`; React Native scaffold; Phase 1 Completion Record |

## Results/Takeaways

Phase 1 creates a native foundation only. Feature parity, Firebase configuration, generated Graphify synchronization, and Flutter retirement remain future work.