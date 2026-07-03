"use client";

import { useEffect } from "react";

const OPEN_OVERLAY_SELECTOR = '[data-state="open"][data-slot$="-content"]';

// Radix's modal primitives (Dialog, AlertDialog, DropdownMenu) lock the page
// by setting `pointer-events: none` on <body> while open and restore it on
// close. Opening a Dialog from inside a DropdownMenuItem's onSelect (used
// throughout components/accounts/*, e.g. "Edit"/"Delete" menu items) stacks
// two of these locks, and their cleanup can race -- occasionally leaving
// body stuck at `pointer-events: none` after everything has visually
// closed, silently blocking every click on the page until reload. This
// clears that stuck state, but only once no Radix overlay is actually
// open, so it never interferes with a dialog's real modal behavior.
export function PointerEventsGuard() {
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const observer = new MutationObserver(() => {
      if (document.body.style.pointerEvents !== "none") return;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (
          document.body.style.pointerEvents === "none" &&
          !document.querySelector(OPEN_OVERLAY_SELECTOR)
        ) {
          document.body.style.pointerEvents = "";
        }
      }, 200);
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  return null;
}
