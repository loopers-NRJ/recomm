import { Loader2 } from "lucide-react";
import Container from "../Container";

const Loading = () => {
  return (
    <Container className="flex h-full min-h-[12rem] w-full items-center justify-center">
      <Loader2 className="animate-spin" size={36} color="#000" />
    </Container>
  );
};

export default Loading;
