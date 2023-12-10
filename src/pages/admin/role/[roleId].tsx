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
import { useState } from "react";
import { idSchema } from "@/utils/validation";
import { withAdminGuard } from "@/hoc/AdminGuard";

interface Command {
  action: "add" | "remove";
  type: AccessType;
}

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

export default function RoleId({ id }: { id: string }) {
  const roleApi = api.role.getRole.useQuery({ id });
  const [commands, setCommands] = useState<Command[]>([]);
  const role = roleApi.data;
  if (roleApi.isError) return <div>{roleApi.error.message}</div>;
  if (roleApi.isLoading) return <div>Loading...</div>;
  if (!role) return <div>Role not found</div>;
  const selectedRoles = role.accesses.map((access) => access.type);
  console.log(commands);

  return (
    <Container className="flex justify-center">
      <div className="flex h-full w-full flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <Label className="flex gap-2">
          <span>Role Name:</span>
          <span>{role.name}</span>
        </Label>
        {/* TODO: remove this */}
        {commands.map((command) => (
          <Label key={command.type} className="flex gap-2">
            <span>{command.action}:</span>
            <span>{command.type}</span>
          </Label>
        ))}
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
                    (selectedRoles.includes(AccessType.subscriber) &&
                      selectedRoles.includes(AccessType.retailer)) ||
                    (commands.some(
                      (command) =>
                        command.type === AccessType.subscriber &&
                        command.action === "add"
                    ) &&
                      commands.some(
                        (command) =>
                          command.type === AccessType.retailer &&
                          command.action === "add"
                      ))
                  }
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.subscriber &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.subscriber,
                          },
                        ]);
                      }
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.retailer &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.retailer,
                          },
                        ]);
                      }
                    } else if (
                      selectedRoles.includes(AccessType.subscriber) &&
                      selectedRoles.includes(AccessType.retailer)
                    ) {
                      setCommands([
                        ...commands,
                        {
                          action: "remove",
                          type: AccessType.subscriber,
                        },
                        {
                          action: "remove",
                          type: AccessType.retailer,
                        },
                      ]);
                    } else {
                      setCommands(
                        commands.filter(
                          (command) =>
                            command.type !== AccessType.subscriber &&
                            command.type !== AccessType.retailer
                        )
                      );
                    }
                  }}
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
                    checked={
                      selectedRoles.includes(AccessType.subscriber) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.subscriber &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.subscriber,
                          },
                        ]);
                      } else if (selectedRoles.includes(AccessType.retailer)) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.subscriber,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) => command.type !== AccessType.subscriber
                          )
                        );
                      }
                    }}
                  />
                  Subscriber
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      selectedRoles.includes(AccessType.retailer) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.retailer &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.retailer,
                          },
                        ]);
                      } else if (
                        selectedRoles.includes(AccessType.subscriber)
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.retailer,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) => command.type !== AccessType.retailer
                          )
                        );
                      }
                    }}
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
                    (selectedRoles.includes(AccessType.createCategory) &&
                      selectedRoles.includes(AccessType.updateCategory) &&
                      selectedRoles.includes(AccessType.deleteCategory)) ||
                    (commands.some(
                      (command) =>
                        command.type === AccessType.createCategory &&
                        command.action === "add"
                    ) &&
                      commands.some(
                        (command) =>
                          command.type === AccessType.updateCategory &&
                          command.action === "add"
                      ) &&
                      commands.some(
                        (command) =>
                          command.type === AccessType.deleteCategory &&
                          command.action === "add"
                      ))
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.createCategory &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.createCategory,
                          },
                        ]);
                      }
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.updateCategory &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.updateCategory,
                          },
                        ]);
                      }
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.deleteCategory &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.deleteCategory,
                          },
                        ]);
                      }
                    } else if (
                      selectedRoles.includes(AccessType.createCategory) &&
                      selectedRoles.includes(AccessType.updateCategory) &&
                      selectedRoles.includes(AccessType.deleteCategory)
                    ) {
                      setCommands([
                        ...commands,
                        {
                          action: "remove",
                          type: AccessType.createCategory,
                        },
                        {
                          action: "remove",
                          type: AccessType.updateCategory,
                        },
                        {
                          action: "remove",
                          type: AccessType.deleteCategory,
                        },
                      ]);
                    } else {
                      setCommands(
                        commands.filter(
                          (command) =>
                            command.type !== AccessType.createCategory &&
                            command.type !== AccessType.updateCategory &&
                            command.type !== AccessType.deleteCategory
                        )
                      );
                    }
                  }}
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
                    checked={
                      selectedRoles.includes(AccessType.createCategory) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.createCategory &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.createCategory,
                          },
                        ]);
                      } else if (
                        selectedRoles.includes(AccessType.updateCategory)
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.createCategory,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) =>
                              command.type !== AccessType.createCategory
                          )
                        );
                      }
                    }}
                  />
                  Create Category
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      selectedRoles.includes(AccessType.updateCategory) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.updateCategory &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.updateCategory,
                          },
                        ]);
                      } else if (
                        selectedRoles.includes(AccessType.updateCategory)
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.updateCategory,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) =>
                              command.type !== AccessType.updateCategory
                          )
                        );
                      }
                    }}
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
                    (selectedRoles.includes(AccessType.createBrand) &&
                      selectedRoles.includes(AccessType.updateBrand) &&
                      selectedRoles.includes(AccessType.deleteBrand)) ||
                    (commands.some(
                      (command) =>
                        command.type === AccessType.createBrand &&
                        command.action === "add"
                    ) &&
                      commands.some(
                        (command) =>
                          command.type === AccessType.updateBrand &&
                          command.action === "add"
                      ) &&
                      commands.some(
                        (command) =>
                          command.type === AccessType.deleteBrand &&
                          command.action === "add"
                      ))
                  }
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.createBrand &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.createBrand,
                          },
                        ]);
                      }
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.updateBrand &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.updateBrand,
                          },
                        ]);
                      }
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.deleteBrand &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.deleteBrand,
                          },
                        ]);
                      }
                    } else if (
                      selectedRoles.includes(AccessType.createBrand) &&
                      selectedRoles.includes(AccessType.updateBrand) &&
                      selectedRoles.includes(AccessType.deleteBrand)
                    ) {
                      setCommands([
                        ...commands,
                        {
                          action: "remove",
                          type: AccessType.createBrand,
                        },
                        {
                          action: "remove",
                          type: AccessType.updateBrand,
                        },
                        {
                          action: "remove",
                          type: AccessType.deleteBrand,
                        },
                      ]);
                    } else {
                      setCommands(
                        commands.filter(
                          (command) =>
                            command.type !== AccessType.createBrand &&
                            command.type !== AccessType.updateBrand &&
                            command.type !== AccessType.deleteBrand
                        )
                      );
                    }
                  }}
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
                    checked={
                      selectedRoles.includes(AccessType.createBrand) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.createBrand &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.createBrand,
                          },
                        ]);
                      } else if (
                        selectedRoles.includes(AccessType.updateBrand)
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.createBrand,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) => command.type !== AccessType.createBrand
                          )
                        );
                      }
                    }}
                  />
                  Create Brand
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      selectedRoles.includes(AccessType.updateBrand) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.updateBrand &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.updateBrand,
                          },
                        ]);
                      } else if (
                        selectedRoles.includes(AccessType.updateBrand)
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.updateBrand,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) => command.type !== AccessType.updateBrand
                          )
                        );
                      }
                    }}
                  />
                  Update Brand
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      selectedRoles.includes(AccessType.deleteBrand) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.deleteBrand &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.deleteBrand,
                          },
                        ]);
                      } else if (
                        selectedRoles.includes(AccessType.deleteBrand)
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.deleteBrand,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) => command.type !== AccessType.deleteBrand
                          )
                        );
                      }
                    }}
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
                    (selectedRoles.includes(AccessType.createModel) &&
                      selectedRoles.includes(AccessType.updateModel) &&
                      selectedRoles.includes(AccessType.deleteModel)) ||
                    (commands.some(
                      (command) =>
                        command.type === AccessType.createModel &&
                        command.action === "add"
                    ) &&
                      commands.some(
                        (command) =>
                          command.type === AccessType.updateModel &&
                          command.action === "add"
                      ) &&
                      commands.some(
                        (command) =>
                          command.type === AccessType.deleteModel &&
                          command.action === "add"
                      ))
                  }
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.createModel &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.createModel,
                          },
                        ]);
                      }
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.updateModel &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.updateModel,
                          },
                        ]);
                      }
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.deleteModel &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.deleteModel,
                          },
                        ]);
                      }
                    } else if (
                      selectedRoles.includes(AccessType.createModel) &&
                      selectedRoles.includes(AccessType.updateModel) &&
                      selectedRoles.includes(AccessType.deleteModel)
                    ) {
                      setCommands([
                        ...commands,
                        {
                          action: "remove",
                          type: AccessType.createModel,
                        },
                        {
                          action: "remove",
                          type: AccessType.updateModel,
                        },
                        {
                          action: "remove",
                          type: AccessType.deleteModel,
                        },
                      ]);
                    } else {
                      setCommands(
                        commands.filter(
                          (command) =>
                            command.type !== AccessType.createModel &&
                            command.type !== AccessType.updateModel &&
                            command.type !== AccessType.deleteModel
                        )
                      );
                    }
                  }}
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
                    checked={
                      selectedRoles.includes(AccessType.createModel) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.createModel &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.createModel,
                          },
                        ]);
                      } else if (
                        selectedRoles.includes(AccessType.updateModel)
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.createModel,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) => command.type !== AccessType.createModel
                          )
                        );
                      }
                    }}
                  />
                  Create Model
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      selectedRoles.includes(AccessType.updateModel) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.updateModel &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.updateModel,
                          },
                        ]);
                      } else if (
                        selectedRoles.includes(AccessType.updateModel)
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.updateModel,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) => command.type !== AccessType.updateModel
                          )
                        );
                      }
                    }}
                  />
                  Update Model
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      selectedRoles.includes(AccessType.deleteModel) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.deleteModel &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.deleteModel,
                          },
                        ]);
                      } else if (
                        selectedRoles.includes(AccessType.deleteModel)
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.deleteModel,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) => command.type !== AccessType.deleteModel
                          )
                        );
                      }
                    }}
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
                    (selectedRoles.includes(AccessType.updateProduct) &&
                      selectedRoles.includes(AccessType.deleteProduct)) ||
                    (commands.some(
                      (command) =>
                        command.type === AccessType.updateProduct &&
                        command.action === "add"
                    ) &&
                      commands.some(
                        (command) =>
                          command.type === AccessType.deleteProduct &&
                          command.action === "add"
                      ))
                  }
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.updateProduct &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.updateProduct,
                          },
                        ]);
                      }
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.deleteProduct &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.deleteProduct,
                          },
                        ]);
                      }
                    } else if (
                      selectedRoles.includes(AccessType.updateProduct) &&
                      selectedRoles.includes(AccessType.deleteProduct)
                    ) {
                      setCommands([
                        ...commands,
                        {
                          action: "remove",
                          type: AccessType.updateProduct,
                        },
                        {
                          action: "remove",
                          type: AccessType.deleteProduct,
                        },
                      ]);
                    } else {
                      setCommands(
                        commands.filter(
                          (command) =>
                            command.type !== AccessType.updateProduct &&
                            command.type !== AccessType.deleteProduct
                        )
                      );
                    }
                  }}
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
                    checked={
                      selectedRoles.includes(AccessType.updateProduct) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.updateProduct &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.updateProduct,
                          },
                        ]);
                      } else if (
                        selectedRoles.includes(AccessType.updateProduct)
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.updateProduct,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) =>
                              command.type !== AccessType.updateProduct
                          )
                        );
                      }
                    }}
                  />
                  Update Product
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      selectedRoles.includes(AccessType.deleteProduct) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.deleteProduct &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.deleteProduct,
                          },
                        ]);
                      } else if (
                        selectedRoles.includes(AccessType.deleteProduct)
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.deleteProduct,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) =>
                              command.type !== AccessType.deleteProduct
                          )
                        );
                      }
                    }}
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
                    (selectedRoles.includes(AccessType.createRole) &&
                      selectedRoles.includes(AccessType.updateUsersRole) &&
                      selectedRoles.includes(AccessType.deleteRole)) ||
                    (commands.some(
                      (command) =>
                        command.type === AccessType.createRole &&
                        command.action === "add"
                    ) &&
                      commands.some(
                        (command) =>
                          command.type === AccessType.updateUsersRole &&
                          command.action === "add"
                      ) &&
                      commands.some(
                        (command) =>
                          command.type === AccessType.deleteRole &&
                          command.action === "add"
                      ))
                  }
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.createRole &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.createRole,
                          },
                        ]);
                      }
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.updateUsersRole &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.updateUsersRole,
                          },
                        ]);
                      }
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.deleteRole &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.deleteRole,
                          },
                        ]);
                      }
                    } else if (
                      selectedRoles.includes(AccessType.createRole) &&
                      selectedRoles.includes(AccessType.updateUsersRole) &&
                      selectedRoles.includes(AccessType.deleteRole)
                    ) {
                      setCommands([
                        ...commands,
                        {
                          action: "remove",
                          type: AccessType.createRole,
                        },
                        {
                          action: "remove",
                          type: AccessType.updateUsersRole,
                        },
                        {
                          action: "remove",
                          type: AccessType.deleteRole,
                        },
                      ]);
                    } else {
                      setCommands(
                        commands.filter(
                          (command) =>
                            command.type !== AccessType.createRole &&
                            command.type !== AccessType.updateUsersRole &&
                            command.type !== AccessType.deleteRole
                        )
                      );
                    }
                  }}
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
                    checked={
                      selectedRoles.includes(AccessType.createRole) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.createRole &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.createRole,
                          },
                        ]);
                      } else if (
                        selectedRoles.includes(AccessType.createRole)
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.createRole,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) => command.type !== AccessType.createRole
                          )
                        );
                      }
                    }}
                  />
                  Create Role
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      selectedRoles.includes(AccessType.updateUsersRole) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.updateUsersRole &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.updateUsersRole,
                          },
                        ]);
                      } else if (
                        selectedRoles.includes(AccessType.updateUsersRole)
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.updateUsersRole,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) =>
                              command.type !== AccessType.updateUsersRole
                          )
                        );
                      }
                    }}
                  />
                  Update User&rsquo;s Role
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      selectedRoles.includes(AccessType.deleteRole) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.deleteRole &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.deleteRole,
                          },
                        ]);
                      } else if (
                        selectedRoles.includes(AccessType.deleteRole)
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.deleteRole,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) => command.type !== AccessType.deleteRole
                          )
                        );
                      }
                    }}
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
                    (selectedRoles.includes(AccessType.updateUser) &&
                      selectedRoles.includes(AccessType.deleteUser)) ||
                    (commands.some(
                      (command) =>
                        command.type === AccessType.updateUser &&
                        command.action === "add"
                    ) &&
                      commands.some(
                        (command) =>
                          command.type === AccessType.deleteUser &&
                          command.action === "add"
                      ))
                  }
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.updateUser &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.updateUser,
                          },
                        ]);
                      }
                      if (
                        !commands.some(
                          (command) =>
                            command.type === AccessType.deleteUser &&
                            command.action === "add"
                        )
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.deleteUser,
                          },
                        ]);
                      }
                    } else if (
                      selectedRoles.includes(AccessType.updateUser) &&
                      selectedRoles.includes(AccessType.deleteUser)
                    ) {
                      setCommands([
                        ...commands,
                        {
                          action: "remove",
                          type: AccessType.updateUser,
                        },
                        {
                          action: "remove",
                          type: AccessType.deleteUser,
                        },
                      ]);
                    } else {
                      setCommands(
                        commands.filter(
                          (command) =>
                            command.type !== AccessType.updateUser &&
                            command.type !== AccessType.deleteUser
                        )
                      );
                    }
                  }}
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
                    checked={
                      selectedRoles.includes(AccessType.updateUser) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.updateUser &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "add",
                            type: AccessType.updateUser,
                          },
                        ]);
                      } else if (
                        selectedRoles.includes(AccessType.updateUser)
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.updateUser,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) => command.type !== AccessType.updateUser
                          )
                        );
                      }
                    }}
                  />
                  Update User
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      selectedRoles.includes(AccessType.deleteUser) ||
                      commands.some(
                        (command) =>
                          command.type === AccessType.deleteUser &&
                          command.action === "add"
                      )
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.deleteUser,
                          },
                        ]);
                      } else if (
                        selectedRoles.includes(AccessType.deleteUser)
                      ) {
                        setCommands([
                          ...commands,
                          {
                            action: "remove",
                            type: AccessType.deleteUser,
                          },
                        ]);
                      } else {
                        setCommands(
                          commands.filter(
                            (command) => command.type !== AccessType.deleteUser
                          )
                        );
                      }
                    }}
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
