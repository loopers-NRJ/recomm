import Container from "@/components/Container";
import { DEVICE_TYPE_HEADER_NAME } from "@/utils/constants";
import { headers } from "next/headers";
import React from "react";
import FilterBarMobile from "./components/filterbar-mobile";

interface ProductPageLayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: ProductPageLayoutProps) => {
  const device = headers().get(DEVICE_TYPE_HEADER_NAME);
  return (
    <Container>
      {device === "mobile" ? <FilterBarMobile /> : "desktop filter bar here"}
      {children}
    </Container>
  );
};

export default Layout;
