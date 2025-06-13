import { title } from "@/app/components/primitives";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About",
    description:
      "Learn more about Aiflo and our mission to make AI accessible to everyone.",
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/about`,
    },
  };
}

export default function AboutPage() {
  return (
    <div>
      <h1 className={title()}>About</h1>
    </div>
  );
}
