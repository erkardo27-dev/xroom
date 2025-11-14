export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 230 100"
      className="text-primary"
      {...props}
    >
      <g transform="translate(10, 10)">
        <rect
          x="0"
          y="0"
          width="20"
          height="80"
          fill="currentColor"
          opacity="0.7"
          transform="translate(25 0) rotate(25 10 40)"
        />
        <rect
          x="0"
          y="0"
          width="20"
          height="80"
          fill="currentColor"
          transform="translate(25 0) rotate(-25 10 40)"
        />
        <text
          x="65"
          y="62"
          fontSize="50"
          fontWeight="bold"
          fill="currentColor"
          letterSpacing="2"
        >
          ROOM
        </text>
      </g>
    </svg>
  );
}
