import type { Metadata } from "next";
import CoachChat from "@/components/CoachChat";

export const metadata: Metadata = {
  title: "Ask the agents",
  description: "Ask the Master Instructor, a belt agent or a pattern agent. Every answer cites its sources.",
};

export default async function CoachPage({
  searchParams,
}: {
  searchParams: Promise<{ pattern?: string; agent?: string; q?: string }>;
}) {
  const { pattern, agent, q } = await searchParams;
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 pt-7">
      <h1 className="bc-h1">Ask the agents</h1>
      <CoachChat pattern={pattern} agent={agent} initialQuestion={q?.slice(0, 1000)} />
    </div>
  );
}
