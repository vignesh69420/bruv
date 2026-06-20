"use client";

export interface ImageOutput {
  prompt: string;
  dataUrl: string;
}

export function ImageCard({ output }: { output: ImageOutput }) {
  return (
    <figure className="bg-card w-full max-w-sm overflow-hidden rounded-xl border">
      {/* data URL — next/image can't optimize it, so a plain img is correct here */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={output.dataUrl}
        alt={output.prompt}
        className="aspect-square w-full object-cover"
      />
      <figcaption className="text-muted-foreground px-3 py-2 text-xs">
        {output.prompt}
      </figcaption>
    </figure>
  );
}
