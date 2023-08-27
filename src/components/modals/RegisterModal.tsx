/* eslint-disable @typescript-eslint/no-floating-promises */
"use client";

// import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
// import { AiFillGithub } from "react-icons/ai";
import { useCallback, useState } from "react";

import useLoginModal from "@/hooks/useLoginModal";
import useRegisterModal from "@/hooks/useRegisterModal";

import Modal from "./Modal";
// import Heading from "../Heading";
import Button from "@/components/Button";
import Heading from "@/components/Heading";

const RegisterModal = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();

  const [isLoading, setIsLoading] = useState(false);

  const onToggle = useCallback(() => {
    registerModal.onClose();
    loginModal.onOpen();
  }, [registerModal, loginModal]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading title="Welcome to Airbnb" subtitle="Create an account!" />
      <Button
        outline
        label="Continue with Google"
        icon={FcGoogle}
        onClick={() => {
          signIn("google");
          setIsLoading(true);
        }}
      />
      {/* <Button 
        outline 
        label="Continue with Github"
        icon={AiFillGithub}
        onClick={() => signIn('github')}
      /> */}
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4">
      <hr />
      <div
        className="
          mt-4 
          text-center 
          font-light 
          text-neutral-500
        "
      >
        <p>
          Already have an account?
          <span
            onClick={onToggle}
            className="
              cursor-pointer
              text-neutral-800 
              hover:underline
            "
          >
            {" "}
            Log in
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={registerModal.isOpen}
      title="Register"
      actionLabel=""
      onClose={registerModal.onClose}
      onSubmit={() => {
        console.log("submit clicked");
        setIsLoading(true);
      }}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default RegisterModal;
