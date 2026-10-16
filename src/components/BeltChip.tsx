import { BELTS } from "@/lib/belts";

/** A small swatch and the belt's name, e.g. a yellow dot and "Yellow". */
export default function BeltChip({ belt }: { belt: string }) {
  const b = BELTS.find((x) => x.name === belt);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full border border-paper/60"
        style={{ backgroundColor: b?.swatch ?? "transparent" }}
        aria-hidden="true"
      />
      {belt} belt
    </span>
  );
}
