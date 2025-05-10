// Privacy Policy Layout
// This file provides the layout for the privacy policy page, ensuring consistent styling with other informational pages. The outer section now handles scrolling.

export default function PrivacyLayout({
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
