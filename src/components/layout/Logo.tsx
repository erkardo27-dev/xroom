export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 230 100"
      className="text-primary"
      fill="currentColor"
      {...props}
    >
      <g className="font-bold">
        {/* The Graphic "X" */}
        <path d="M-5 0 L55 0 L25 100 L-35 100 Z" opacity="0.7" />
        <path d="M5 100 L65 100 L95 0 L35 0 Z" />

        {/* The "ROOM" text */}
        <text
          x="65"
          y="70"
          fontSize="60"
          fontWeight="bold"
          fill="currentColor"
        >
          ROOM
        </text>
      </g>
    </svg>
  );
}
