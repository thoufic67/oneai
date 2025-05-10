// Terms of Service Layout
// This file provides the layout for the terms of service page, ensuring consistent styling and scroll behavior with the privacy policy page.

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center gap-4 py-8 md:py-10 p-4 pb-24 max-h-[100dvh] overflow-y-auto">
      <div className="inline-block max-w-5xl text-center justify-center">
        {children}
      </div>
    </section>
  );
}
