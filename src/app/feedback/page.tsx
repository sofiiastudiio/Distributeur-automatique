"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import { useEventTracker } from "@/hooks/useEventTracker";

export default function FeedbackPage() {
  const router = useRouter();
  const sessionId = useSessionStore((s) => s.sessionId);
  const { track, flush } = useEventTracker();
  const [realism, setRealism] = useState(0);
  const [wouldUse, setWouldUse] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!sessionId || realism === 0 || !wouldUse) return;
    setSubmitting(true);

    track("feedback_submit", {
      metadata: { realism, would_use: wouldUse, has_comment: comment.length > 0 },
    });
    flush();

    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        realism,
        would_use: wouldUse,
        comment,
      }),
    });

    router.push("/merci");
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="glass w-full max-w-lg rounded-3xl p-8 animate-fade-in-up">
        <h2 className="mb-6 text-2xl font-bold text-center">Votre avis nous intéresse</h2>

        {/* Question 1: Realism */}
        <div className="mb-8">
          <p className="mb-3 text-foreground/80">
            Cette expérience vous a-t-elle semblé réaliste ?
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRealism(star)}
                className={`text-4xl transition-transform hover:scale-110 ${
                  star <= realism ? "grayscale-0" : "grayscale opacity-30"
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        {/* Question 2: Would use */}
        <div className="mb-8">
          <p className="mb-3 text-foreground/80">
            Utiliseriez-vous une vraie machine SafeBox ?
          </p>
          <div className="flex gap-3">
            {[
              { value: "oui", label: "Oui" },
              { value: "non", label: "Non" },
              { value: "peut-etre", label: "Peut-être" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setWouldUse(opt.value)}
                className={`flex-1 rounded-xl px-4 py-3 font-medium transition-colors ${
                  wouldUse === opt.value
                    ? "bg-primary text-white"
                    : "bg-surface-light text-foreground/70 hover:bg-surface-light/70"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 3: Comments */}
        <div className="mb-8">
          <p className="mb-3 text-foreground/80">Commentaires (optionnel)</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full rounded-xl bg-surface-light px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Vos suggestions ou remarques..."
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || realism === 0 || !wouldUse}
          className="w-full rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-primary-light active:scale-95 disabled:opacity-40"
        >
          {submitting ? "Envoi..." : "Envoyer"}
        </button>
      </div>
    </div>
  );
}
