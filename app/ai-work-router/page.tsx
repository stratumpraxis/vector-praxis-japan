import type { Metadata } from "next";
import RouterClient from "./router-client";

export const metadata: Metadata = {
  title: "AI Work Router | AI自動化を安全・低コストに設計",
  description:
    "仕事をRULE・AI・HUMANに分解し、コスト制御、承認ポイント、停止条件、履歴、再利用、可観測性まで設計する実務ツール。",
};

export default function AIWorkRouterPage() {
  return <RouterClient />;
}
