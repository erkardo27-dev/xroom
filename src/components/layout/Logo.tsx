export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 100"
      className="text-primary"
      {...props}
    >
      <defs>
        <path id="parallelogram" d="M0 0 H50 L70 100 H20 Z" />
      </defs>

      <g transform="translate(5, -12) scale(1.1)">
        <g transform="translate(10, 10)">
            <use href="#parallelogram" fill="currentColor" opacity="0.7" transform="skewX(-20)"/>
            <use href="#parallelogram" fill="currentColor" transform="skewX(20) scale(-1, 1) translate(-70, 0)"/>
        </g>
        <text
          x="100"
          y="72"
          fontSize="60"
          letterSpacing="2"
          fontWeight="bold"
          fill="currentColor"
        >
          ROOM
        </text>
      </g>
    </svg>
  );
}
