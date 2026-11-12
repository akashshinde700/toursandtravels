import { CUTS, type CutId } from "@/lib/data";

// A real side-view car photo. Each wheel has two layers over the photo's own rim:
// a sharp copy of the rim that rotates (centres measured per photo, so it turns true),
// and a motion-blurred copy that fades in at speed. Rotation comes from --spin (set by the
// road trip from distance travelled) or the .spin-wheels / .spin-on-hover classes.
export function Car({ id, className = "", alt = "" }: { id: CutId; className?: string; alt?: string }) {
  const { aspect, wheels } = CUTS[id];
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: aspect }}>
      <img src={`/images/cars/${id}.webp?v=7`} alt={alt} className="absolute inset-0 h-full w-full select-none" draggable={false} />
      {wheels.map((w, i) => (
        <div key={i} className="wheel absolute" style={{ left: `${w.x - w.w / 2}%`, top: `${w.y - w.h / 2}%`, width: `${w.w}%`, height: `${w.h}%` }}>
          <img src={`/images/cars/${id}-rim${i}.webp?v=7`} alt="" className="rim-sharp absolute inset-0 h-full w-full" draggable={false} />
          <img src={`/images/cars/${id}-wheel${i}.webp?v=7`} alt="" className="rim absolute inset-0 h-full w-full" draggable={false} />
        </div>
      ))}
    </div>
  );
}
