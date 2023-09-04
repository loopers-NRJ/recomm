/* eslint-disable @typescript-eslint/no-floating-promises */
"use client";

import { useCallback, useState } from "react";
// import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { AiFillGithub } from "react-icons/ai";

import useRegisterModal from "@/hooks/useRegisterModal";
import useLoginModal from "@/hooks/useLoginModal";

import Modal from "./Modal";
import Heading from "@/components/Heading";
import Button from "@/components/Button";

const LoginModal = () => {
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const [isLoading, setIsLoading] = useState(false);

  const onToggle = useCallback(() => {
    loginModal.onClose();
    registerModal.onOpen();
  }, [loginModal, registerModal]);

  const footerContent = (
    <>
      <hr />
      <div
        className="
      mt-4 text-center font-light text-neutral-500"
      >
        <p>
          First time using Recomm?
          <span
            onClick={onToggle}
            className="
              cursor-pointer
              text-neutral-800 
              hover:underline
            "
          >
            {" "}
            Create an account
          </span>
        </p>
      </div>
    </>
  );

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading title="Welcome back" subtitle="Login to your account!" />
      <Button
        outline
        label="Continue with Google"
        icon={FcGoogle}
        onClick={() => {
          signIn("google");
        }}
      />
      <Button
        outline
        label="Continue with Github"
        icon={AiFillGithub}
        onClick={() => {
          signIn("github");
        }}
      />
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={loginModal.isOpen}
      title="Login"
      actionLabel=""
      onClose={loginModal.onClose}
      onSubmit={() => setIsLoading(true)}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default LoginModal;
