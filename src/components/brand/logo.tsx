/** The lime "e" mark, traced from the 2026 catalogue cover (vector paths, not a raster). */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <rect width="96" height="96" rx="21.12" fill="#c8f03c" />
      <path
        fill="#1a1714"
        fillRule="evenodd"
        d="M69.59 50.907C72.151 38.985 64.563 27.243 52.64 24.682 40.718 22.12 28.976 29.709 26.415 41.632 23.854 53.554 31.442 65.295 43.365 67.857 48.455 68.95 53.767 68.21 58.365 65.767L54.01 57.58C47.765 60.9 40.011 58.529 36.691 52.284 33.37 46.039 35.741 38.285 41.986 34.965 48.231 31.644 55.985 34.015 59.306 40.26 60.723 42.926 61.153 46.007 60.52 48.96Z"
      />
      <rect x="35.194" y="41.633" width="34.886" height="9.274" fill="#1a1714" />
    </svg>
  );
}
