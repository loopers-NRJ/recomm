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
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/router";

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
    AccessType.updateUsersRole,
    AccessType.deleteRole,
    AccessType.updateUser,
    AccessType.deleteUser,
    // Add more here
  ],
};

export default function CreateRole() {
  const [selectedRoles, setSelectedRoles] = useState<AccessType[]>([]);
  const [roleName, setRoleName] = useState("");
  const createRoleApi = api.role.createRole.useMutation();
  const [creatingRole, setCreatingRole] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const hasReadAccess = selectedRoles.includes(AccessType.readAccess);
    const hasAdminAccess = roleConfig.readAccess.some((adminAccess) =>
      selectedRoles.includes(adminAccess)
    );
    if (!hasReadAccess && hasAdminAccess) {
      setSelectedRoles([...selectedRoles, AccessType.readAccess]);
    } else if (hasReadAccess && !hasAdminAccess) {
      setSelectedRoles(
        selectedRoles.filter((role) => role !== AccessType.readAccess)
      );
    }
  }, [selectedRoles]);
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
            checked={selectedRoles.includes(AccessType.readAccess)}
            onCheckedChange={(isChecked) => {
              if (isChecked) {
                setSelectedRoles([...selectedRoles, AccessType.readAccess]);
              } else {
                setSelectedRoles(
                  selectedRoles.filter((role) => role !== AccessType.readAccess)
                );
              }
            }}
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
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={(isChecked) => {
                    console.log(isChecked);
                    if (isChecked) {
                      const roles = selectedRoles.filter(
                        (role) =>
                          role !== AccessType.subscriber &&
                          role !== AccessType.retailer
                      );
                      roles.push(AccessType.subscriber, AccessType.retailer);
                      setSelectedRoles(roles);
                    } else {
                      const roles = selectedRoles.filter(
                        (role) =>
                          role !== AccessType.subscriber &&
                          role !== AccessType.retailer
                      );
                      setSelectedRoles(roles);
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
                    checked={selectedRoles.includes(AccessType.subscriber)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.subscriber,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.subscriber
                          )
                        );
                      }
                    }}
                  />
                  Subscriber
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.retailer)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.retailer,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.retailer
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
                    selectedRoles.includes(AccessType.createCategory) &&
                    selectedRoles.includes(AccessType.updateCategory) &&
                    selectedRoles.includes(AccessType.deleteCategory)
                  }
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={(isChecked) => {
                    console.log(isChecked);
                    if (isChecked) {
                      const roles = selectedRoles.filter(
                        (role) => !role.endsWith("Category")
                      );
                      roles.push(
                        AccessType.createCategory,
                        AccessType.updateCategory,
                        AccessType.deleteCategory
                      );
                      setSelectedRoles(roles);
                    } else {
                      const roles = selectedRoles.filter(
                        (role) => !role.endsWith("Category")
                      );
                      setSelectedRoles(roles);
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
                    checked={selectedRoles.includes(AccessType.createCategory)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.createCategory,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.createCategory
                          )
                        );
                      }
                    }}
                  />
                  Create Category
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.updateCategory)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.updateCategory,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.updateCategory
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
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.deleteCategory,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.deleteCategory
                          )
                        );
                      }
                    }}
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
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={(isChecked) => {
                    console.log(isChecked);
                    if (isChecked) {
                      const roles = selectedRoles.filter(
                        (role) => !role.endsWith("Brand")
                      );
                      roles.push(
                        AccessType.createBrand,
                        AccessType.updateBrand,
                        AccessType.deleteBrand
                      );
                      setSelectedRoles(roles);
                    } else {
                      const roles = selectedRoles.filter(
                        (role) => !role.endsWith("Brand")
                      );
                      setSelectedRoles(roles);
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
                    checked={selectedRoles.includes(AccessType.createBrand)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.createBrand,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.createBrand
                          )
                        );
                      }
                    }}
                  />
                  Create Brand
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.updateBrand)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.updateBrand,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.updateBrand
                          )
                        );
                      }
                    }}
                  />
                  Update Brand
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.deleteBrand)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.deleteBrand,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.deleteBrand
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
                    selectedRoles.includes(AccessType.createModel) &&
                    selectedRoles.includes(AccessType.updateModel) &&
                    selectedRoles.includes(AccessType.deleteModel)
                  }
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={(isChecked) => {
                    console.log(isChecked);
                    if (isChecked) {
                      const roles = selectedRoles.filter(
                        (role) => !role.endsWith("Model")
                      );
                      roles.push(
                        AccessType.createModel,
                        AccessType.updateModel,
                        AccessType.deleteModel
                      );
                      setSelectedRoles(roles);
                    } else {
                      const roles = selectedRoles.filter(
                        (role) => !role.endsWith("Model")
                      );
                      setSelectedRoles(roles);
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
                    checked={selectedRoles.includes(AccessType.createModel)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.createModel,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.createModel
                          )
                        );
                      }
                    }}
                  />
                  Create Model
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.updateModel)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.updateModel,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.updateModel
                          )
                        );
                      }
                    }}
                  />
                  Update Model
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.deleteModel)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.deleteModel,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.deleteModel
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
                    selectedRoles.includes(AccessType.updateProduct) &&
                    selectedRoles.includes(AccessType.deleteProduct)
                  }
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={(isChecked) => {
                    console.log(isChecked);
                    if (isChecked) {
                      const roles = selectedRoles.filter(
                        (role) => !role.endsWith("Product")
                      );
                      roles.push(
                        AccessType.updateProduct,
                        AccessType.deleteProduct
                      );
                      setSelectedRoles(roles);
                    } else {
                      const roles = selectedRoles.filter(
                        (role) => !role.endsWith("Product")
                      );
                      setSelectedRoles(roles);
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
                    checked={selectedRoles.includes(AccessType.updateProduct)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.updateProduct,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.updateProduct
                          )
                        );
                      }
                    }}
                  />
                  Update Product
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.deleteProduct)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.deleteProduct,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.deleteProduct
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
                    selectedRoles.includes(AccessType.createRole) &&
                    selectedRoles.includes(AccessType.updateUsersRole) &&
                    selectedRoles.includes(AccessType.deleteRole)
                  }
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={(isChecked) => {
                    console.log(isChecked);
                    if (isChecked) {
                      const roles = selectedRoles.filter(
                        (role) => !role.endsWith("Role")
                      );
                      roles.push(
                        AccessType.createRole,
                        AccessType.updateUsersRole,
                        AccessType.deleteRole
                      );
                      setSelectedRoles(roles);
                    } else {
                      const roles = selectedRoles.filter(
                        (role) => !role.endsWith("Role")
                      );
                      setSelectedRoles(roles);
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
                    checked={selectedRoles.includes(AccessType.createRole)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.createRole,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.createRole
                          )
                        );
                      }
                    }}
                  />
                  Create Role
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.updateUsersRole)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.updateUsersRole,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.updateUsersRole
                          )
                        );
                      }
                    }}
                  />
                  Update User&rsquo;s Role
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.deleteRole)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.deleteRole,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.deleteRole
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
                    selectedRoles.includes(AccessType.updateUser) &&
                    selectedRoles.includes(AccessType.deleteUser)
                  }
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={(isChecked) => {
                    console.log(isChecked);
                    if (isChecked) {
                      const roles = selectedRoles.filter(
                        (role) => !role.endsWith("User")
                      );
                      roles.push(AccessType.updateUser, AccessType.deleteUser);
                      setSelectedRoles(roles);
                    } else {
                      const roles = selectedRoles.filter(
                        (role) => !role.endsWith("User")
                      );
                      setSelectedRoles(roles);
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
                    checked={selectedRoles.includes(AccessType.updateUser)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.updateUser,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.updateUser
                          )
                        );
                      }
                    }}
                  />
                  Update User
                </Label>
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(AccessType.deleteUser)}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setSelectedRoles([
                          ...selectedRoles,
                          AccessType.deleteUser,
                        ]);
                      } else {
                        setSelectedRoles(
                          selectedRoles.filter(
                            (role) => role !== AccessType.deleteUser
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

        <Button
          className="self-end"
          disabled={
            selectedRoles.length === 0 ||
            roleName.trim().length === 0 ||
            creatingRole
          }
          onClick={() => {
            setCreatingRole(true);
            createRoleApi
              .mutateAsync({
                name: roleName,
                accesses: selectedRoles,
              })
              .then(() => {
                setRoleName("");
                setSelectedRoles([]);
                setCreatingRole(false);
                void router.push("/admin/roles");
              })
              .catch(() => {
                setCreatingRole(false);
              });
          }}
        >
          Create Role with {selectedRoles.length} access
        </Button>
      </div>
    </Container>
  );
}
