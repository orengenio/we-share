# Mode 20 — /og-apps

The App Revenue Channel. Doctrine: **treat the App Store and Google Play as revenue channels, not upload destinations** — and treat shipping as a system, not a one-time upload. Masters modeled: Paul Hudson (iOS), Jake Wharton (Android), Felix Krause (release automation) — see `references/masters-library.md`.

## Bid/no-bid FIRST (an app is an expensive funnel until proven otherwise)

Build native only when at least two are true: recurring-engagement product (daily/weekly use) · native features required (push, offline, camera, background) · store distribution is itself the acquisition channel · subscription monetization fits. Otherwise: web app on Coolify wins (faster, owned, no 15–30% store commission — verify current store terms). Log the decision like any bid/no-bid.

## The operating spec (every app, in order)

```
Product strategy → Native UX → Secure backend → Clean architecture
→ Analytics + crash reporting → Store compliance → Release automation → Monetization
```

**iOS doctrine (Hudson):** Swift/SwiftUI, premium-simple-native. Apple users expect polish, privacy, speed — design debt is conversion debt. App Review Guidelines are required reading BEFORE the build, not at rejection time.

**Android doctrine (Wharton):** Kotlin + Compose, clean layers: `UI → ViewModel → Use Cases → Repository → API/Database`. No messy apps — architecture discipline is what separates a toy from a business asset.

**Release doctrine (Krause):** manual uploads are prohibited as a workflow. The pipeline:

```
repo → CI/CD → automated tests → fastlane build → screenshots + metadata
→ TestFlight / internal track → App Store + Google Play release
```

## Monetization models (pick deliberately)

Subscription-first bias (recurring backend doctrine) · IAP for consumables · paid-upfront only for tool-class apps with instant obvious value · freemium gates at the moment of proven value, never before it. Store commission is a real margin line in the Money Math — model it.

## ASO = the store listing is a funnel page

Title/subtitle keywords · screenshots designed as a sales page (first two do the selling) · ratings velocity plan (in-app prompt at the win moment, per store rules) · description with the DR spine compressed. Edge Engine applies: a listing that could be any app's listing converts like one.

## Wiring + compliance

App events → GHL via webhook/n8n bridge so attribution and pipelines hold (the app is a GHL organ like the website) · privacy: App Privacy labels + Play Data safety declared truthfully, consent flows per /og-compliance · analytics + crash reporting from day one — an app without numbers is a rumor.

## Execution honesty

In Claude Code/Cowork: scaffold and build for real (Swift/Kotlin projects, fastlane config). Elsewhere: this mode outputs the full build brief — spec, architecture, screen map, ASO plan, pipeline config — ready for the dev seat.

## Produce (`artifacts/<slug>/apps/`)

`app-bid-no-bid.md` · `app-spec.md` (screens, architecture, backend) · `aso-plan.md` · `release-pipeline.md` · `monetization-model.md` (with store-fee Money Math) · store-compliance checklist → Launch Gate.
