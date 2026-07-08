/**
 * WeShare attribution embed — add to orengen.io marketing pages.
 *
 * Usage:
 *   <script src="https://weshare.orengen.io/weshare-attribution.js" data-api="https://weshare.orengen.io" defer></script>
 *
 * Forms with data-weshare-lead are submitted to WeShare /api/track/lead (credentials included).
 * URL params: ?ws_ref=AFFILIATE_CODE or ?ws_partner=PARTNER_CODE trigger a tracking redirect.
 */
(function () {
  "use strict";

  var script = document.currentScript;
  var API_BASE = (script && script.getAttribute("data-api")) || "https://weshare.orengen.io";

  function getParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (e) {
      return null;
    }
  }

  function maybeRedirectTracking() {
    var affiliate = getParam("ws_ref") || getParam("ref");
    var partner = getParam("ws_partner") || getParam("partner");
    if (!affiliate && !partner) return;

    var key = "ws_attr_redirect_" + (affiliate || partner);
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    var path = affiliate ? "/r/" + encodeURIComponent(affiliate) : "/s/" + encodeURIComponent(partner);
    var dest = encodeURIComponent(window.location.href);
    window.location.replace(API_BASE + path + "?dest=" + dest);
  }

  function readField(form, names) {
    for (var i = 0; i < names.length; i++) {
      var el = form.querySelector('[name="' + names[i] + '"]');
      if (el && el.value) return el.value.trim();
    }
    return "";
  }

  function bindLeadForms() {
    var forms = document.querySelectorAll("form[data-weshare-lead]");
    forms.forEach(function (form) {
      if (form.dataset.weshareBound) return;
      form.dataset.weshareBound = "1";

      form.addEventListener("submit", function (ev) {
        ev.preventDefault();

        var payload = {
          firstName: readField(form, ["firstName", "first_name", "fname"]) || "Visitor",
          lastName: readField(form, ["lastName", "last_name", "lname"]) || "Lead",
          email: readField(form, ["email", "Email"]),
          phone: readField(form, ["phone", "tel", "mobile"]) || undefined,
          company: readField(form, ["company", "organization"]) || undefined,
          message: readField(form, ["message", "notes"]) || undefined,
          source: form.getAttribute("data-source") || "orengen_embed",
          smsConsent: !!form.querySelector('[name="smsConsent"]:checked, [name="sms_consent"]:checked'),
        };

        if (!payload.email) {
          alert("Email is required.");
          return;
        }

        var submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        fetch(API_BASE + "/api/track/lead", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then(function (res) {
            return res.json().then(function (body) {
              return { ok: res.ok, body: body };
            });
          })
          .then(function (result) {
            if (!result.ok) throw new Error((result.body && result.body.error) || "Submit failed");
            form.dispatchEvent(new CustomEvent("weshare:lead-submitted", { detail: result.body }));
            var onSuccess = form.getAttribute("data-success-url");
            if (onSuccess) window.location.href = onSuccess;
            else if (submitBtn) submitBtn.disabled = false;
          })
          .catch(function (err) {
            console.error("[WeShare]", err);
            alert("Could not submit lead. Please try again.");
            if (submitBtn) submitBtn.disabled = false;
          });
      });
    });
  }

  maybeRedirectTracking();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindLeadForms);
  } else {
    bindLeadForms();
  }
})();
