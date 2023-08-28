import { z } from "zod";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const BidFormSchema = z.object({
  price: z.number().positive("Price must be a positive number"),
});

type BidFormData = z.infer<typeof BidFormSchema>;

function BidForm() {
  const [formData, setFormData] = useState<BidFormData>({ price: 0 });

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseFloat(event.target.value);
    setFormData({ ...formData, price: newPrice });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (BidFormSchema.safeParse(formData).success) {
      // Perform bid placement logic here using formData.price
      console.log("Bid placed:", formData.price);
    } else {
      console.error("Form data validation failed");
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
}

export default BidForm;
