import type { Metadata } from "next";
import ProgressDashboard from "@/components/ProgressDashboard";

export const metadata: Metadata = {
  title: "My progress",
  description: "Where you stand on the patterns for your rank.",
};

export default function ProgressPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-7 px-4 pt-7">
      <h1 className="bc-h1">My progress</h1>
      <ProgressDashboard />
    </div>
  );
}
