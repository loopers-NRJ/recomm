import BiddingModal from "../BiddingModal";
import LoginModal from "../LoginModal";
import PostingModal from "../PostingModal";
import RegisterModal from "../RegisterModal";

const ModalRenderer = () => {
  return (
    <>
      <LoginModal />
      <RegisterModal />
      <BiddingModal />
      <PostingModal />
    </>
  );
};

export default ModalRenderer;
