import { Header as HeaderType } from "@/types/blocks/header";
import HeaderServer from "./header-server";
import HeaderClient from "./header-client";

export default function Header({ header }: { header: HeaderType }) {
  if (header.disabled) {
    return null;
  }

  return (
    <>
      {/* 服务端渲染 - SEO 友好的静态结构 */}
      <HeaderServer header={header} />

      {/* 客户端渲染 - 增强的交互功能 */}
      <HeaderClient header={header} />
    </>
  );
}
