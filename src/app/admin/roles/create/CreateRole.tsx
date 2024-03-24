"use client";

import Container from "@/components/Container";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { AccessType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AccordionSection from "./AccordionSection";
import { errorHandler } from "@/utils/errorHandler";
import CityPicker from "./CityPicker";

export default function CreateRole() {
  const [selectedRoles, setSelectedRoles] = useState<Set<AccessType>>(
    new Set(),
  );
  const [roleName, setRoleName] = useState("");
  const [cities, setStates] = useState<Set<string>>(new Set());
  const createRoleApi = api.role.create.useMutation({
    onSuccess: () => {
      router.push("/admin/tables/roles");
    },
    onError: errorHandler,
  });
  const router = useRouter();

  const handleCheckedChange = useCallback(
    (checked: boolean, types: [AccessType, ...AccessType[]]) => {
      const newSelectedRoles = new Set(selectedRoles);
      if (checked) {
        types.forEach((type) => newSelectedRoles.add(type));
      } else {
        types.forEach((type) => newSelectedRoles.delete(type));
      }
      setSelectedRoles(newSelectedRoles);
    },
    [selectedRoles],
  );

  /**
   * This is a temporary solution to prevent hydration error:
   * Using Checkbox inside AccordionSection cause hydration error in nextjs
   * follow this issue: https://github.com/shadcn-ui/ui/issues/1273
   */
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  if (!isMounted) return null;

  return (
    <Container className="flex justify-center">
      <div className="flex h-full w-full flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <Label className="flex flex-col gap-2">
          Role Name
          <Input
            placeholder="Name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </Label>
        <div>
          <h1>Select cities for the role {roleName && `'${roleName}'`}</h1>
          <Accordion type="single" collapsible>
            <CityPicker value={cities} onChange={setStates} />
          </Accordion>
        </div>
        <div>
          <h1>
            Select required access for the role {roleName && `'${roleName}'`}
          </h1>
          <Accordion type="single" collapsible>
            <AccordionSection
              title="general"
              types={[AccessType.primeSeller]}
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
              selectedRoles={selectedRoles}
              handleCheckedChange={handleCheckedChange}
            />
            <AccordionSection
              title="product"
              types={[AccessType.updateProduct, AccessType.deleteProduct]}
              selectedRoles={selectedRoles}
              handleCheckedChange={handleCheckedChange}
            />
            <AccordionSection
              title="role"
              types={[
                AccessType.createRole,
                AccessType.updateRole,
                AccessType.updateUsersRole,
                AccessType.deleteRole,
              ]}
              selectedRoles={selectedRoles}
              handleCheckedChange={handleCheckedChange}
            />
            <AccordionSection
              title="user"
              types={[AccessType.updateUser, AccessType.deleteUser]}
              selectedRoles={selectedRoles}
              handleCheckedChange={handleCheckedChange}
            />

            <AccordionSection
              title="log"
              types={[AccessType.viewLogs, AccessType.clearLogs]}
              selectedRoles={selectedRoles}
              handleCheckedChange={handleCheckedChange}
            />
            <AccordionSection
              title="report"
              types={[AccessType.viewReports, AccessType.deleteReport]}
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
              selectedRoles={selectedRoles}
              handleCheckedChange={handleCheckedChange}
            />
            <AccordionSection
              title="configuration"
              types={[
                AccessType.viewAppConfiguration,
                AccessType.updateAppConfiguration,
              ]}
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
              selectedRoles={selectedRoles}
              handleCheckedChange={handleCheckedChange}
            />
          </Accordion>
        </div>
        <Button
          className="self-end"
          disabled={
            selectedRoles.size === 0 ||
            roleName.trim().length === 0 ||
            createRoleApi.isLoading
          }
          onClick={() => {
            createRoleApi.mutate({
              name: roleName,
              accesses: [...selectedRoles],
              cities: [...cities],
            });
          }}
        >
          Create Role with {selectedRoles.size} access
        </Button>
      </div>
    </Container>
  );
}
