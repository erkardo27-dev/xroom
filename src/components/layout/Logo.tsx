export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="368"
      height="111"
      viewBox="0 0 368 111"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="80"
        fontWeight="bold"
        fontFamily="Inter, sans-serif"
      >
        <tspan fill="hsl(var(--accent))">X</tspan>
        <tspan fill="hsl(var(--primary))">Room</tspan>
      </text>
    </svg>
  );
}
