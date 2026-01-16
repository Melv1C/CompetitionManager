export const Logo = () => {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="200" rx="40" fill="#111827" />

      <path
        d="M100 35L156.287 67.5V132.5L100 165L43.7128 132.5V67.5L100 35Z"
        stroke="url(#paint0_linear)"
        strokeWidth="8"
        strokeLinejoin="round"
      />

      <path
        d="M115 65L75 105H105L85 145L125 105H95L115 65Z"
        fill="url(#paint1_linear)"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <defs>
        <linearGradient
          id="paint0_linear"
          x1="43.7128"
          y1="35"
          x2="156.287"
          y2="165"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#61DAFB" /> <stop offset="1" stopColor="#EF4444" />{' '}
        </linearGradient>
        <linearGradient
          id="paint1_linear"
          x1="75"
          y1="65"
          x2="125"
          y2="145"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFD600" />
          <stop offset="1" stopColor="#FB923C" />
        </linearGradient>
      </defs>
    </svg>
  );
};
