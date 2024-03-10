import Container from "@/components/Container";
import React from "react";

interface ProductPageLayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: ProductPageLayoutProps) => {
  return (
    <Container>
      {children}
    </Container>
  );
};

export default Layout;
