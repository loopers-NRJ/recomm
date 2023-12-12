import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AccessType } from "@prisma/client";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import Container from "@/components/Container";
import { Badge } from "@/components/ui/badge";
import { api } from "@/utils/api";
import { idSchema } from "@/utils/validation";
import { withAdminGuard } from "@/hoc/AdminGuard";
import { useCallback, useState } from "react";
import ServerError from "@/components/common/ServerError";
import Loading from "@/components/common/Loading";
import { Loader2 } from "lucide-react";

export const getServerSideProps = withAdminGuard(async (context) => {
  const id = context.params?.roleId as string;
  const result = idSchema.safeParse(id);
  if (result.success) {
    return {
      props: { id },
    };
  }
  return {
    notFound: true,
  };
});

type Processing =
  | { action: "adding" | "removing"; types: [AccessType, ...AccessType[]] }
  | false;

export default function RoleId({ id }: { id: string }) {
  const roleApi = api.role.getRole.useQuery({ id });
  const role = roleApi.data;

  const [processing, setProcessing] = useState<Processing>(false);

  const addAccessToRole = api.role.addAccessToRole.useMutation();
  const removeAccessFromRole = api.role.removeAccessFromRole.useMutation();

  const handleCheckedChange = useCallback(
    async (checked: boolean, types: [AccessType, ...AccessType[]]) => {
      try {
        if (checked) {
          setProcessing({ action: "adding", types });
          await addAccessToRole.mutateAsync({ roleId: id, accesses: types });
        } else {
          setProcessing({ action: "removing", types });
          await removeAccessFromRole.mutateAsync({
            roleId: id,
            accesses: types,
          });
        }
        await roleApi.refetch();
      } catch (error) {
        console.error(error);
      } finally {
        setProcessing(false);
      }
    },
    [addAccessToRole, id, removeAccessFromRole, roleApi]
  );

  if (roleApi.isError) return <ServerError message={roleApi.error.message} />;
  if (roleApi.isLoading) return <Loading />;
  if (!role) return <div>Role not found</div>;
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

function AccordionSection({
  title,
  types,
  processing,
  selectedRoles,
  handleCheckedChange,
}: {
  title: string;
  types: [AccessType, ...AccessType[]];
  selectedRoles: AccessType[];
  processing: Processing;
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
            checked={types.every((type) => selectedRoles.includes(type))}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={(checked) => {
              void handleCheckedChange(!!checked, types);
            }}
          />
          {title}
          <Badge>
            {selectedRoles.reduce((acc, curr) => {
              return acc + +types.includes(curr);
            }, 0)}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-4">
        <div className="flex flex-col gap-2">
          {types.map((type) => (
            <Label className="flex items-center gap-2" key={type}>
              {processing &&
              processing.types.includes(type) &&
              ((processing.action === "adding" &&
                !selectedRoles.includes(type)) ||
                (processing.action === "removing" &&
                  selectedRoles.includes(type))) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Checkbox
                  checked={selectedRoles.includes(type)}
                  onCheckedChange={(checked) => {
                    void handleCheckedChange(!!checked, [type]);
                  }}
                  disabled={processing !== false}
                />
              )}
              {type}
            </Label>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
