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
import { useRouter } from "next/router";

export default function RoleId() {
  const router = useRouter();
  const routerApi = api.role.getRole.useQuery({
    id: router.query.id as string,
  });
  const role = routerApi.data;
  if (routerApi.isError) return <div>{routerApi.error.message}</div>;
  if (routerApi.isLoading) return <div>Loading...</div>;
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
          <AccordionItem value="general">
            <AccordionTrigger>
              <div className="flex items-center gap-2 font-bold">
                <Checkbox
                  checked={
                    selectedRoles.includes(AccessType.subscriber) &&
                    selectedRoles.includes(AccessType.retailer)
                  }
                />
                general
                <Badge>
                  {Number(selectedRoles.includes(AccessType.subscriber)) +
                    Number(selectedRoles.includes(AccessType.retailer))}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-4">
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.subscriber)}
                    disabled
                  />
                  Subscriber
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.retailer)}
                    disabled
                  />
                  Retailer
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="category">
            <AccordionTrigger>
              <div className="flex items-center gap-2 font-bold">
                <Checkbox
                  checked={
                    selectedRoles.includes(AccessType.createCategory) &&
                    selectedRoles.includes(AccessType.updateCategory) &&
                    selectedRoles.includes(AccessType.deleteCategory)
                  }
                  disabled
                />
                Category
                <Badge>
                  {Number(selectedRoles.includes(AccessType.createCategory)) +
                    Number(selectedRoles.includes(AccessType.updateCategory)) +
                    Number(selectedRoles.includes(AccessType.deleteCategory))}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-4">
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.createCategory)}
                    disabled
                  />
                  Create Category
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.updateCategory)}
                    disabled
                  />
                  Update Category
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.deleteCategory)}
                    disabled
                  />
                  Delete Category
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="brand">
            <AccordionTrigger>
              <div className="flex items-center gap-2 font-bold">
                <Checkbox
                  checked={
                    selectedRoles.includes(AccessType.createBrand) &&
                    selectedRoles.includes(AccessType.updateBrand) &&
                    selectedRoles.includes(AccessType.deleteBrand)
                  }
                  disabled
                />
                Brand
                <Badge>
                  {Number(selectedRoles.includes(AccessType.createBrand)) +
                    Number(selectedRoles.includes(AccessType.updateBrand)) +
                    Number(selectedRoles.includes(AccessType.deleteBrand))}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-4">
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.createBrand)}
                    disabled
                  />
                  Create Brand
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.updateBrand)}
                    disabled
                  />
                  Update Brand
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.deleteBrand)}
                    disabled
                  />
                  Delete Brand
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="model">
            <AccordionTrigger>
              <div className="flex items-center gap-2 font-bold">
                <Checkbox
                  checked={
                    selectedRoles.includes(AccessType.createModel) &&
                    selectedRoles.includes(AccessType.updateModel) &&
                    selectedRoles.includes(AccessType.deleteModel)
                  }
                  disabled
                />
                Model
                <Badge>
                  {Number(selectedRoles.includes(AccessType.createModel)) +
                    Number(selectedRoles.includes(AccessType.updateModel)) +
                    Number(selectedRoles.includes(AccessType.deleteModel))}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-4">
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.createModel)}
                    disabled
                  />
                  Create Model
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.updateModel)}
                    disabled
                  />
                  Update Model
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.deleteModel)}
                    disabled
                  />
                  Delete Model
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="product">
            <AccordionTrigger>
              <div className="flex items-center gap-2 font-bold">
                <Checkbox
                  checked={
                    selectedRoles.includes(AccessType.updateProduct) &&
                    selectedRoles.includes(AccessType.deleteProduct)
                  }
                />
                Product
                <Badge>
                  {Number(selectedRoles.includes(AccessType.updateProduct)) +
                    Number(selectedRoles.includes(AccessType.deleteProduct))}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-4">
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.updateProduct)}
                    disabled
                  />
                  Update Product
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.deleteProduct)}
                    disabled
                  />
                  Delete Product
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="role">
            <AccordionTrigger>
              <div className="flex items-center gap-2 font-bold">
                <Checkbox
                  checked={
                    selectedRoles.includes(AccessType.createRole) &&
                    selectedRoles.includes(AccessType.updateUsersRole) &&
                    selectedRoles.includes(AccessType.deleteRole)
                  }
                  disabled
                />
                Role
                <Badge>
                  {Number(selectedRoles.includes(AccessType.createRole)) +
                    Number(selectedRoles.includes(AccessType.updateUsersRole)) +
                    Number(selectedRoles.includes(AccessType.deleteRole))}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-4">
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.createRole)}
                    disabled
                  />
                  Create Role
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.updateUsersRole)}
                    disabled
                  />
                  Update User&rsquo;s Role
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.deleteRole)}
                    disabled
                  />
                  Delete Role
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="user">
            <AccordionTrigger>
              <div className="flex items-center gap-2 font-bold">
                <Checkbox
                  checked={
                    selectedRoles.includes(AccessType.updateUser) &&
                    selectedRoles.includes(AccessType.deleteUser)
                  }
                />
                User
                <Badge>
                  {Number(selectedRoles.includes(AccessType.updateUser)) +
                    Number(selectedRoles.includes(AccessType.deleteUser))}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-4">
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.updateUser)}
                  />
                  Update User
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.deleteUser)}
                  />
                  Delete User
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Container>
  );
}
