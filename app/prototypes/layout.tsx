/**
 * Layout for all pages under /prototypes.
 * Renders children (e.g. the digital piano) with no extra wrapper.
 */
export default function PrototypesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
