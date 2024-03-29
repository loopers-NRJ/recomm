import "./HeartButton.css";
import StarAnimation from "./HeartAnimation";
import StarIcon from "./HeartIcon";

function HeartButton({ starred, ...rest }: { starred: boolean, onClick: () => void }) {
  return (
    <button
      className={`StarButton ${starred ? "StarButton--starred" : ""}`}
      type="button"
      {...rest}
    >
      <StarAnimation starred={starred} />
      <StarIcon />
    </button>
  );
}
export default HeartButton;
