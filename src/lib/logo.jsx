const ClixLogo = ({ size, color = "#16a34a", title = "Clix" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    role="img"
    aria-label={title}
  >
    {/* Chat bubble */}
    <path
      d="M32 8C18 8 8 18 8 32c0 6 2 11 6 15l-2 9 9-5c3 1 7 2 11 2 14 0 24-10 24-21S46 8 32 8z"
      fill={color}
    />
    {/* Letter C inside */}
    <path
      d="M42 22a12 12 0 1 0 0 15"
      fill="none"
      stroke="#fff"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ClixLogo;
