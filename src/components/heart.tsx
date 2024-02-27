import { createElement } from "react";
import { setup, styled } from "goober";

setup(createElement);

export interface HeartProp {
  isClick: boolean;
  onClick: () => void;
}

/* eslint-disable */
const HeartUI = (styled("div") as any)(({ isClick }: Partial<HeartProp>) => [
/* eslint-enable */
  {
    width: "70px",
    height: "70px",
    background: 'url("/heart_seq.png") no-repeat',
    display: "inline-block",
    backgroundPosition: `-15px center`,
    position: "absolute",
    top: "0",
    right: "0",
    cursor: "pointer",
    zIndex: "5",
    scale: "0.7",
  },
  isClick && {
    backgroundPosition: `-2814px center`,
    transition: "background 1s steps(28)",
  },
]);

export default HeartUI;
