export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 100"
      className="text-primary"
      {...props}
    >
      <g fill="currentColor" className="font-bold">
        <text
          x="0"
          y="80"
          fontSize="90"
        >
          X
        </text>
        <text
          x="60"
          y="70"
          fontSize="60"
          letterSpacing="2"
        >
          ROOM
        </text>
      </g>
    </svg>
  );
}
