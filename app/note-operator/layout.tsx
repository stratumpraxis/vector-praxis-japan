import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Note Operator | Vector Praxis",
  description: "既存note記事を1件1差分で安全に更新するためのVector内部Control UI。",
  robots: { index: false, follow: false },
};

export default function NoteOperatorLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
