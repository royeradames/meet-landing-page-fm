"use client";

import { useId, useState } from "react";

/* Meet is a practice brand with no app behind it, so the button says so instead of pretending to download. */
export function DownloadButton({ variant }: { variant: "blue" | "purple" }) {
  const [explained, setExplained] = useState(false);
  const noteId = useId();
  return (
    <span className="download">
      <button type="button" className={`button button-${variant}`} aria-describedby={noteId} onClick={() => setExplained(true)}>
        Download <span className="version">v1.3</span>
      </button>
      <span id={noteId} className={explained ? "demo-note" : "sr-only"} role="status">
        {explained ? "Demo only: Meet is a Frontend Mentor practice brand, so there’s no app to download." : ""}
      </span>
    </span>
  );
}
