import React, { type FC, useState } from "react";
import { z } from "zod";
import { api } from "@/trpc/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import toast from "react-hot-toast";

const BidFormSchema = z.object({
  price: z
    .number()
    .int("Price cannot have decimal values")
    .positive("Price must not be negative"),
});

type BidFormData = z.infer<typeof BidFormSchema>;

interface BidFormProps {
  roomId: string;
  onClose: () => void;
}

const BidForm: FC<BidFormProps> = ({ roomId, onClose }) => {
  const [formData, setFormData] = useState<BidFormData>({ price: 0 });
  const placeBid = api.room.createBid.useMutation();

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseFloat(event.target.value);
    setFormData({ ...formData, price: newPrice });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (BidFormSchema.safeParse(formData).success) {
      const data = {
        price: formData.price,
        roomId,
      };
      placeBid.mutate(data);
      onClose();
    } else {
      toast.error("Bid Cannot have decimal price values");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3 mt-5">
      <div className="mb-3 flex items-baseline justify-between">
        <label className="text-xl font-medium">Your Price:</label>
        <Input
          type="number"
          inputMode="numeric"
          value={formData.price}
          onChange={handlePriceChange}
          className="w-1/2"
        />
      </div>
      <Button className="my-2 w-full" type="submit">
        Place Bid
      </Button>
    </form>
  );
};

export default BidForm;
