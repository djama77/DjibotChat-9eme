import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DjibotChat 9ème — Réussir mon BEF | Djibouti",
  description: "Assistant scolaire pour les élèves de 9ème année à Djibouti : comprendre les cours, corriger les exercices et préparer le BEF.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
