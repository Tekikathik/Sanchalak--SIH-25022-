export function Logo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Sanchalak Logo"
      width={size}
      height={size}
      className={`object-contain select-none transition-transform hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
