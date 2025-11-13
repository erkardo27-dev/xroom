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
        fill="hsl(var(--primary))"
      >
        XRoom
      </text>
    </svg>
  );
}
