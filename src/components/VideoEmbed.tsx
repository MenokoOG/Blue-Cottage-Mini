"use client";

import { useState } from "react";
import type { Video } from "@/lib/types";

/**
 * A demonstration video that loads nothing from YouTube until it is played.
 *
 * The poster is a plain thumbnail and the player is swapped in on click, from
 * youtube-nocookie.com, so opening a pattern page sets no YouTube cookies and
 * makes no player requests. Credit and a link to the original always show.
 */
export default function VideoEmbed({ video, label }: { video: Video; label: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <figure className="flex flex-col gap-2.5">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-muted/55 bg-ink">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={`${label}: ${video.title}`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 flex h-full w-full items-center justify-center"
            aria-label={`Play video: ${label}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- a third-party poster; the optimiser would proxy it for no gain */}
            <img
              src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-200 group-hover:opacity-100"
            />
            <span
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-cottage text-ink transition duration-200 group-hover:scale-105"
              style={{ boxShadow: "0 0 30px rgba(131,168,202,0.7)" }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <figcaption className="font-mono text-[11px] leading-relaxed tracking-[0.06em] text-muted-deep">
        {video.title} · {video.channel} ·{" "}
        <a href={video.url} target="_blank" rel="noopener noreferrer" className="bc-link text-ink">
          Watch on YouTube
        </a>
      </figcaption>
    </figure>
  );
}
