"use client";

import { Label } from "@/components/ui/label";
import { AccessType } from "@prisma/client";
import { Accordion } from "@/components/ui/accordion";
import Container from "@/components/Container";
import { api } from "@/trpc/react";
import { useCallback, useState } from "react";
import AccordionSection, { type Processing } from "./AccordionSection";
import type { RolePayloadIncluded } from "@/types/prisma";
import { useRouter } from "next/navigation";
import { errorHandler } from "@/utils/errorHandler";
import CityUpdater from "./CityUpdater";

export default function EditRole({ role }: { role: RolePayloadIncluded }) {
  const [processing, setProcessing] = useState<Processing>(false);

  const addAccessToRole = api.role.addAccess.useMutation({
    onMutate: async (variables) => {
      setProcessing({ action: "adding", types: variables.accesses });
    },
    onSuccess: () => {
      router.refresh();
    },
    onError: errorHandler,
    onSettled: () => {
      setProcessing(false);
    },
  });
  const removeAccessFromRole = api.role.removeAccess.useMutation({
    onMutate: async (variables) => {
      setProcessing({ action: "removing", types: variables.accesses });
    },
    onSuccess: () => {
      router.refresh();
    },
    onError: errorHandler,
    onSettled: () => {
      setProcessing(false);
    },
  });
  const router = useRouter();
  const handleCheckedChange = useCallback(
    (checked: boolean, types: [AccessType, ...AccessType[]]) => {
      if (checked) {
        addAccessToRole.mutate({
          roleId: role.id,
          accesses: types,
        });
      } else {
        removeAccessFromRole.mutate({
          roleId: role.id,
          accesses: types,
        });
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
        <div>
          <h1>Select cities for the role</h1>
          <Accordion type="single" collapsible>
            <CityUpdater
              roleId={role.id}
              value={new Set(role.createdCity.map((city) => city.value))}
            />
          </Accordion>
        </div>
        <div>
          <h1>Select required access for the role</h1>
          <Accordion type="single" collapsible>
            <AccordionSection
              title="general"
              types={[AccessType.primeSeller]}
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
            <AccordionSection
              title="log"
              types={[AccessType.viewLogs, AccessType.clearLogs]}
              processing={processing}
              selectedRoles={selectedRoles}
              handleCheckedChange={handleCheckedChange}
            />
            <AccordionSection
              title="report"
              types={[AccessType.viewReports, AccessType.deleteReport]}
              processing={processing}
              selectedRoles={selectedRoles}
              handleCheckedChange={handleCheckedChange}
            />
            <AccordionSection
              title="coupon"
              types={[
                AccessType.createCoupon,
                AccessType.updateCoupon,
                AccessType.deleteCoupon,
              ]}
              processing={processing}
              selectedRoles={selectedRoles}
              handleCheckedChange={handleCheckedChange}
            />
            <AccordionSection
              title="configuration"
              types={[
                AccessType.viewAppConfiguration,
                AccessType.updateAppConfiguration,
              ]}
              processing={processing}
              selectedRoles={selectedRoles}
              handleCheckedChange={handleCheckedChange}
            />
            <AccordionSection
              title="city"
              types={[
                AccessType.createCity,
                AccessType.updateCity,
                AccessType.deleteCity,
              ]}
              processing={processing}
              selectedRoles={selectedRoles}
              handleCheckedChange={handleCheckedChange}
            />
          </Accordion>
        </div>
      </div>
    </Container>
  );
}
