import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allSlugs, bySlug } from "@/lib/patterns";
import Quiz from "@/components/Quiz";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  return p ? { title: `${p.name} quiz` } : {};
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pattern = bySlug(slug);
  if (!pattern) notFound();
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pt-7">
      <h1 className="bc-h2">{pattern.name} quiz</h1>
      <Quiz pattern={pattern} slug={slug} />
    </div>
  );
}
