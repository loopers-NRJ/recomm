"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AccessType } from "@prisma/client";
import { Accordion } from "@/components/ui/accordion";
import Container from "@/components/Container";
import { api } from "@/trpc/react";
import { useCallback, useState } from "react";
import AccordionSection, { type Processing } from "./AccordionSection";
import type { RolePayloadIncluded } from "@/types/prisma";
import { useRouter } from "next/navigation";

export default function RoleEdit({ role }: { role: RolePayloadIncluded }) {
  const [processing, setProcessing] = useState<Processing>(false);

  const addAccessToRole = api.role.addAccess.useMutation();
  const removeAccessFromRole = api.role.removeAccess.useMutation();
  const router = useRouter();
  const handleCheckedChange = useCallback(
    async (checked: boolean, types: [AccessType, ...AccessType[]]) => {
      try {
        if (checked) {
          setProcessing({ action: "adding", types });
          await addAccessToRole.mutateAsync({
            roleId: role.id,
            accesses: types,
          });
        } else {
          setProcessing({ action: "removing", types });
          await removeAccessFromRole.mutateAsync({
            roleId: role.id,
            accesses: types,
          });
        }
        router.refresh();
      } catch (error) {
        console.error(error);
      } finally {
        setProcessing(false);
      }
    },
    [addAccessToRole, removeAccessFromRole],
  );

  const selectedRoles = role.accesses.map((access) => access.type);

  return (
    <Container className="flex justify-center">
      <div className="flex h-full w-full flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <Label className="flex gap-2">
          <span>Role Name:</span>
          <span>{role.name}</span>
        </Label>
        <Label className="flex items-center gap-2">
          <Checkbox
            checked={selectedRoles.includes(AccessType.readAccess)}
            disabled
          />
          Admin page access
        </Label>
        <Accordion type="single" collapsible>
          <AccordionSection
            title="general"
            types={[AccessType.subscriber, AccessType.retailer]}
            processing={processing}
            selectedRoles={selectedRoles}
            handleCheckedChange={handleCheckedChange}
          />
          <AccordionSection
            title="category"
            types={[
              AccessType.createCategory,
              AccessType.updateCategory,
              AccessType.deleteCategory,
            ]}
            processing={processing}
            selectedRoles={selectedRoles}
            handleCheckedChange={handleCheckedChange}
          />
          <AccordionSection
            title="brand"
            types={[
              AccessType.createBrand,
              AccessType.updateBrand,
              AccessType.deleteBrand,
            ]}
            processing={processing}
            selectedRoles={selectedRoles}
            handleCheckedChange={handleCheckedChange}
          />
          <AccordionSection
            title="model"
            types={[
              AccessType.createModel,
              AccessType.updateModel,
              AccessType.deleteModel,
            ]}
            processing={processing}
            selectedRoles={selectedRoles}
            handleCheckedChange={handleCheckedChange}
          />
          <AccordionSection
            title="product"
            types={[AccessType.updateProduct, AccessType.deleteProduct]}
            processing={processing}
            selectedRoles={selectedRoles}
            handleCheckedChange={handleCheckedChange}
          />
          <AccordionSection
            title="role"
            types={[
              AccessType.createRole,
              AccessType.updateUsersRole,
              AccessType.deleteRole,
            ]}
            processing={processing}
            selectedRoles={selectedRoles}
            handleCheckedChange={handleCheckedChange}
          />
          <AccordionSection
            title="user"
            types={[AccessType.updateUser, AccessType.deleteUser]}
            processing={processing}
            selectedRoles={selectedRoles}
            handleCheckedChange={handleCheckedChange}
          />
        </Accordion>
      </div>
    </Container>
  );
}
