import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Who is behind Blue Cottage Mini, and how it is made.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-7 px-4 pt-7">
      <header>
        <h1 className="bc-h1">About</h1>
        <p className="mt-3 text-[15px] leading-[1.75] text-muted-deep text-pretty">
          Blue Cottage Mini: A Tour of ITF Taekwon-Do is a study guide to the 24 Chang-Hon patterns.
          It teaches the story and structure of each pattern and points you to a demonstration,
          and leaves the movements themselves to your instructor.
        </p>
      </header>

      <section aria-label="Instructor" className="bc-panel">
        <h2 className="bc-label mb-2.5">Directed by</h2>
        <p className="font-display text-[22px] font-bold">Master Lawrence Jefferson</p>
        <p className="mt-1 text-[15px] leading-[1.7]">
          7th Degree · International Master Instructor (Sahyeon) · USA
        </p>
        <p className="mt-3 text-[14px] leading-[1.65] text-muted-deep">
          Listed in the{" "}
          <a
            href="https://dafydhaase.wixsite.com/titf/verify-ranks"
            target="_blank"
            rel="noopener noreferrer"
            className="bc-link text-ink"
          >
            TITF Black Belt Registry
          </a>{" "}
          of the Traditional International Taekwon-Do Federation.
        </p>
      </section>

      <section aria-label="Movement text" className="bc-ghost">
        <h2 className="bc-label mb-2">Why there is no move-by-move text</h2>
        <p className="text-[15px] leading-[1.7] text-muted-deep">
          Published pattern sequences are copyrighted, and no free-licensed version exists. This
          app therefore ships only open, cited facts. When the instructor supplies movement text
          of their own, it is added in <code className="font-mono text-[13px]">src/data/movements.json</code>{" "}
          and the stepper and quiz switch on by themselves.
        </p>
      </section>

      <section aria-label="Agents" className="bc-card">
        <h2 className="bc-label mb-2">How the agents work</h2>
        <p className="text-[15px] leading-[1.7]">
          A Master Instructor, six belt agents and 24 pattern agents share one cited body of
          facts. Each question is routed to the agent that knows most about it, and can only be
          answered from that agent&rsquo;s excerpts.{" "}
          <Link href="/agents" className="bc-link text-ink">
            Meet them
          </Link>
          .
        </p>
      </section>

      <p className="font-mono text-[11px] leading-relaxed tracking-[0.06em] text-muted-deep">
        <Link href="/sources" className="bc-link text-ink">
          Every source and licence
        </Link>
      </p>
    </div>
  );
}
