import type { Metadata } from "next";
import RouterClient from "./router-client";

export const metadata: Metadata = {
  title: "AI Work Router | 仕事に合わせてAI運用を設計",
  description:
    "仕事の種類・複雑さ・リスク・成果物から、AIの役割、処理レベル、確認ポイント、再利用テンプレートを設計する実務ツール。",
};

export default function AIWorkRouterPage() {
  return <RouterClient />;
}
