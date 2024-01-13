"use client"

import { toggleFavourite } from "@/server/actions";
import { useState } from "react";


interface FavoriteToggleProps {
  id: string;
  state: boolean;
  checkedIcon: JSX.Element;
  uncheckedIcon: JSX.Element;
}

const FavoriteToggle: React.FC<FavoriteToggleProps> = ({ id, state, checkedIcon, uncheckedIcon }) => {
  const [isFav, setIsFav] = useState(state);
  return (
    <div
      className="absolute cursor-pointer top-0 right-0"
      onClick={async () => {
        setIsFav(!isFav);
        await toggleFavourite(id);
      }}
    >
      {state ? checkedIcon : uncheckedIcon}
    </div>
  );
}

export default FavoriteToggle;
