import Container from "@/components/Container";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AccessType } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/router";
import { withAdminGuard } from "@/hoc/AdminGuard";

export const getServerSideProps = withAdminGuard();

const roleConfig = {
  readAccess: [
    AccessType.createCategory,
    AccessType.updateCategory,
    AccessType.deleteCategory,
    AccessType.createBrand,
    AccessType.updateBrand,
    AccessType.deleteBrand,
    AccessType.createModel,
    AccessType.updateModel,
    AccessType.deleteModel,
    AccessType.updateProduct,
    AccessType.deleteProduct,
    AccessType.createRole,
    AccessType.updateRole,
    AccessType.updateUsersRole,
    AccessType.deleteRole,
    AccessType.updateUser,
    AccessType.deleteUser,
    // Add more here
  ],
};

function AccordionSection({
  title,
  types,
  selectedRoles,
  handleCheckedChange,
}: {
  title: string;
  types: [AccessType, ...AccessType[]];
  selectedRoles: Set<AccessType>;
  handleCheckedChange: (
    checked: boolean,
    types: [AccessType, ...AccessType[]]
  ) => void | Promise<void>;
}) {
  return (
    <AccordionItem value={title}>
      <AccordionTrigger>
        <div className="flex items-center gap-2 font-bold">
          <Checkbox
            checked={types.every((type) => selectedRoles.has(type))}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={(checked) => {
              void handleCheckedChange(!!checked, types);
            }}
          />
          {title}
          <Badge>
            {[...selectedRoles].reduce((acc, curr) => {
              return acc + +types.includes(curr);
            }, 0)}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-4">
        <div className="flex flex-col gap-2">
          {types.map((type) => (
            <Label className="flex items-center gap-2" key={type}>
              <Checkbox
                checked={selectedRoles.has(type)}
                onCheckedChange={(checked) => {
                  void handleCheckedChange(!!checked, [type]);
                }}
              />
              {type}
            </Label>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function CreateRole() {
  const [selectedRoles, setSelectedRoles] = useState<Set<AccessType>>(
    new Set()
  );
  const [roleName, setRoleName] = useState("");
  const createRoleApi = api.role.createRole.useMutation();
  const [creatingRole, setCreatingRole] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const hasReadAccess = selectedRoles.has(AccessType.readAccess);
    const isAllowed = roleConfig.readAccess.some((adminAccess) =>
      selectedRoles.has(adminAccess)
    );
    const newSelectedRoles = new Set(selectedRoles);
    if (!hasReadAccess && isAllowed) {
      newSelectedRoles.add(AccessType.readAccess);
    } else if (hasReadAccess && !isAllowed) {
      newSelectedRoles.delete(AccessType.readAccess);
    }
    setSelectedRoles(newSelectedRoles);
  }, [selectedRoles]);

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
    [selectedRoles]
  );

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
        <Label className="flex items-center gap-2">
          <Checkbox
            checked={selectedRoles.has(AccessType.readAccess)}
            disabled
          />
          Admin page access
        </Label>
        <Accordion type="single" collapsible>
          <AccordionSection
            title="general"
            types={[AccessType.subscriber, AccessType.retailer]}
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
        </Accordion>

        <Button
          className="self-end"
          disabled={
            selectedRoles.size === 0 ||
            roleName.trim().length === 0 ||
            creatingRole
          }
          onClick={() => {
            setCreatingRole(true);
            createRoleApi
              .mutateAsync({
                name: roleName,
                accesses: [...selectedRoles],
              })
              .then(() => void router.push("/admin/roles"))
              .catch(() => {
                setCreatingRole(false);
              });
          }}
        >
          Create Role with {selectedRoles.size} access
        </Button>
      </div>
    </Container>
  );
}
