export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 100"
      className="text-primary"
      {...props}
    >
      <g fill="currentColor" fontFamily="sans-serif" fontWeight="bold">
        <text
          x="0"
          y="80"
          fontSize="90"
        >
          X
        </text>
        <text
          x="85"
          y="68"
          fontSize="60"
        >
          ROOM
        </text>
      </g>
    </svg>
  );
}
