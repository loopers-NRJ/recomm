import { z } from "zod";
import React, { FC, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { api } from "@/utils/api";
import { useToast } from "./ui/use-toast";

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
  const placeBid = api.room.postABid.useMutation();
  const { toast } = useToast();

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
      console.log("Bid placed:", formData.price);
    } else {
      toast({
        title: "Invaid Bid",
        description: "Bid Cannot have decimal price values",
        variant: "destructive",
      });
      console.log("Invalid Bid");
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
