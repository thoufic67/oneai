/**
 * @file app/changelog/layout.tsx
 * @description Layout for the changelog page. Ensures consistent structure for changelog and future subpages.
 */
export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
