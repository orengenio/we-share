"use client";

import { useEffect, useState } from "react";

/**
 * Cookie consent gate for non-essential third-party scripts.
 *
 * Currently gates the LeadConnector (GoHighLevel) chat widget, which sets its
 * own third-party cookies. Under GDPR/ePrivacy these require prior opt-in
 * consent, and under CCPA/CPRA they require notice + opt-out. The widget script
 * is only injected AFTER the visitor accepts.
 *
 * Consent choice is persisted in a first-party cookie (`ws_consent`) so the
 * banner does not reappear on every page. "essential" cookies (auth session,
 * referral attribution) are out of scope here and load regardless — those are
 * handled separately and are disclosed in the Privacy Policy.
 */

const CONSENT_COOKIE = "ws_consent";
const ONE_YEAR = 60 * 60 * 24 * 365;

const CHAT_WIDGET_ID = "leadconnector-chat-widget-loader";

function readConsent(): "granted" | "denied" | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  const value = match.split("=")[1];
  return value === "granted" || value === "denied" ? value : null;
}

function writeConsent(value: "granted" | "denied") {
  document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`;
}

function loadChatWidget() {
  if (typeof document === "undefined") return;
  if (document.getElementById(CHAT_WIDGET_ID)) return; // already loaded
  const s = document.createElement("script");
  s.id = CHAT_WIDGET_ID;
  s.src = "https://widgets.leadconnectorhq.com/loader.js";
  s.setAttribute(
    "data-resources-url",
    "https://widgets.leadconnectorhq.com/chat-widget/loader.js"
  );
  s.setAttribute("data-widget-id", "6a44d91d686a90131ba0d5cb");
  s.setAttribute("data-source", "WEB_USER");
  s.async = true;
  document.body.appendChild(s);
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = readConsent();
    if (consent === "granted") {
      loadChatWidget();
    } else if (consent === null) {
      setVisible(true);
    }
    // "denied" → do nothing, no banner, no widget
  }, []);

  function accept() {
    writeConsent("granted");
    loadChatWidget();
    setVisible(false);
  }

  function decline() {
    writeConsent("denied");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[60] p-4"
    >
      <div
        className="max-w-3xl mx-auto rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{
          background: "rgba(0, 21, 48, 0.97)",
          border: "1px solid rgba(148,163,184,0.25)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          backdropFilter: "blur(20px)",
        }}
      >
        <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(203,213,225,0.9)" }}>
          We use cookies to run our chat support and understand site usage.
          Essential cookies (sign-in and referral tracking) are always on. You can
          accept optional cookies or continue with essential only. See our{" "}
          <a
            href="/docs/privacy-policy.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
            style={{ color: "#CC5500" }}
          >
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{
              color: "rgba(203,213,225,0.85)",
              border: "1px solid rgba(148,163,184,0.3)",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            Essential only
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors"
            style={{ background: "#CC5500", boxShadow: "0 8px 24px rgba(204,85,0,0.3)" }}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
