import { useEffect } from "react";
import Container from "../Container";
import { cn } from "@/lib/utils";

interface ErrorProps extends React.ComponentProps<"div"> {
  children?: string;
  message: string;
}

const ServerError = ({
  message,
  className,
  children = "Oops! Something went wrong",

  ...props
}: ErrorProps) => {
  useEffect(() => {
    console.error(message);
  }, [message]);

  return (
    <Container
      className={cn(
        "flex h-full w-full items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
    </Container>
  );
};

export default ServerError;
