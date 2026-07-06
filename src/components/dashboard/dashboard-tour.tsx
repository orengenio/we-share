"use client";

import { useEffect, useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

/**
 * First-run guided tour of the dashboard. Runs automatically once (tracked by
 * User.onboardingTourDone), and can be replayed via the "Take a tour" button
 * that dispatches the `weshare:start-tour` event.
 */
export default function DashboardTour({ role }: { role: string }) {
  const runTour = useCallback((markDone: boolean) => {
    const isAffiliate = role === "AFFILIATE";
    const isPartner = role === "PARTNER";

    const steps = [
      {
        popover: {
          title: "Welcome to WeShare 👋",
          description: "Quick 30-second tour so you know where everything is. You can replay it anytime from the top bar.",
        },
      },
      {
        element: '[data-tour="nav"]',
        popover: {
          title: "Your navigation",
          description: "Everything lives here — your dashboard, earnings, resources, and settings.",
        },
      },
      ...(isAffiliate
        ? [{
            element: '[data-tour="nav-links"]',
            popover: { title: "Your links", description: "Grab your referral link and create campaign links to track what's working." },
          }]
        : []),
      ...(isPartner
        ? [{
            element: '[data-tour="nav-links"]',
            popover: { title: "Your leads", description: "Your assigned leads and pipeline live here once you're certified." },
          }]
        : []),
      {
        element: '[data-tour="nav-resources"]',
        popover: { title: "Documents & materials", description: "Your agreement, handbook, brand assets, and copy-paste swipe copy are all in Resources." },
      },
      {
        element: '[data-tour="nav-settings"]',
        popover: { title: "Settings", description: "Add a profile photo and set up payouts & tax (Stripe) so you get paid every Friday." },
      },
      {
        element: '[data-tour="main"]',
        popover: { title: "Get started", description: "Work through the 'Before you begin' checklist at the top of your dashboard — then you're live!" },
      },
    ];

    const d = driver({
      showProgress: true,
      steps,
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Done",
      onDestroyed: () => {
        if (markDone) {
          fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ onboardingTourDone: true }),
          }).catch(() => {});
        }
      },
    });
    d.drive();
  }, [role]);

  // Auto-run once for new users.
  useEffect(() => {
    if (role === "ADMIN") return;
    let cancelled = false;
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (cancelled || !d.success) return;
        if (!d.data.onboardingTourDone) {
          // Small delay so the layout has painted.
          setTimeout(() => runTour(true), 600);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [role, runTour]);

  // Manual replay trigger.
  useEffect(() => {
    const handler = () => runTour(false);
    window.addEventListener("weshare:start-tour", handler);
    return () => window.removeEventListener("weshare:start-tour", handler);
  }, [runTour]);

  return null;
}
