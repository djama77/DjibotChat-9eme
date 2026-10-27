import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DjibotChat — 9e année",
  description: "Assistant pédagogique pour les élèves de 9e année à Djibouti, avec sources issues des guides du professeur.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
