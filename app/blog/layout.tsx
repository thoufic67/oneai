// @file layout.tsx
// @description Layout for the blog section, used for both the blog list and individual blog post pages.

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="container mx-auto flex flex-col items-center justify-center gap-4 py-8 md:py-10 px-4">
      <div className="w-full">{children}</div>
    </section>
  );
}
