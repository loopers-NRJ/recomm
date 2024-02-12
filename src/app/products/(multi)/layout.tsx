import Container from "@/components/Container";
import { deviceTypeHeaderName } from "@/utils/constants";
import { headers } from "next/headers";
import React from "react";
import FilterBarMobile from "./components/filterbar-mobile";

interface ProductPageLayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: ProductPageLayoutProps) => {
  const device = headers().get(deviceTypeHeaderName);
  return (
    <Container>
      {device === "mobile" ? <FilterBarMobile /> : "world"}
      {children}
    </Container>
  );
};

export default Layout;
