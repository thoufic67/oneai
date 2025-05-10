// Cancellation & Refunds Layout
// This file provides the layout for the cancellation and refunds page, ensuring consistent styling and scroll behavior with other public pages.

export default function CancellationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center h-full gap-4 py-8 md:py-10 p-4 pb-24 max-h-[100dvh] overflow-y-auto">
      <div className="inline-block max-w-5xl text-center justify-center w-full">
        {children}
      </div>
    </section>
  );
}
