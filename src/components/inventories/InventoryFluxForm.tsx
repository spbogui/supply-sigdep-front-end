import {
  faCalendar,
  faCheckCircle,
  faEdit,
  faLeaf,
  faList,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Card,
  Group,
  Menu,
  Select,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useModals } from "@mantine/modals";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useFindFlux, useFluxMutation } from "../../hooks/flux";
import { useOperationMutation } from "../../hooks/operation";
import {
  useFindProductAttributeBatchNumber,
  useProductAttributeMutation,
  useProgramProducts as useGetProgramProducts,
} from "../../hooks/product";
import { ProductAttributeSave } from "../../models/Product";
import {
  ProductOperationFlux,
  ProductOperationFluxSave,
} from "../../models/ProductOperation";
import OperationService from "../../services/OperationService";
import { Fn } from "../../utils/Fn";
import {
  INVENTORY_COLUMNS,
  INVENTORY_EDIT_COLUMNS,
} from "../tables/columns/inventory";
import CustomTable from "../tables/CustomTable";
import { EditableCell } from "../tables/EditableCell";

type InventoryFluxFormProps = {
  inventoryUuid: string;
  program: string;
};

const InventoryProductForm = (props: InventoryFluxFormProps) => {
  const { inventoryUuid, program } = props;

  const navigate = useNavigate();
  const modals = useModals();
  const queryClient = useQueryClient();

  const { data: inventory, refetch: refetchInventory } = useQuery(
    ["inventory-full", inventoryUuid],
    async () => await OperationService.getOne(inventoryUuid, "v=full")
  );

  const [fluxUuid, setFluxUuid] = useState<string>("");
  const [fluxAttributeUuid, setFluxAttributeUuid] = useState<string>("");
  const [attributeUuid, setAttributeUuid] = useState<string>("");
  const [toolTipText, setToolTipText] = useState<string>("Rien a dire");
  const [attributeAlreadyExist, setAttributeAlreadyExist] =
    useState<boolean>(false);
  const [inventoryType, setInventoryType] = useState("TOTAL");

  const form = useForm<{
    product: string;
    batchNumber: string;
    quantity: string;
    expiryDate: Date | string;
    observation: string | undefined;
    uuid: string | undefined;
  }>({
    initialValues: {
      product: "",
      batchNumber: "",
      quantity: "",
      expiryDate: "",
      observation: "",
      uuid: "",
    },
    validate: (values) => ({
      product: !values.product || values.product === "" ? "Champ requis" : null,
      quantity:
        values.quantity === undefined || values.quantity.length === 0
          ? "Champ requis"
          : parseInt(values.quantity) === 0
          ? "Quantité > 0"
          : null,
      batchNumber:
        values.batchNumber.length === 0 || values.batchNumber === ""
          ? "Champ requis"
          : attributeAlreadyExist
          ? "Lot existant"
          : null,
      expiryDate: !values.expiryDate ? "Champ requis" : null,
    }),
  });

  // Queries

  const { attribute, getAttribute } = useFindProductAttributeBatchNumber(
    form.values.batchNumber,
    form.values.product
  );

  const { productSelectList } = useGetProgramProducts(program);
  const { flux, findFlux } = useFindFlux(fluxUuid, inventoryUuid, "inventory");

  // Mutations

  const { createAttribute, updateAttribute } = useProductAttributeMutation();
  const {
    addFlux,
    removeFlux,
    updateFluxAttribute,
    updateFluxObservation,
    updateFluxQuantity,
    updateFlux,
  } = useFluxMutation(inventoryUuid);

  const { updateOperationStatus, removeOperation } = useOperationMutation();

  const handleEditFluxQuantityInLine = (
    id: string,
    value: number,
    attribute?: string
  ) => {
    if (attribute) {
      updateFluxAttribute(
        { value: { quantity: value }, attributeUuid: attribute },
        {
          onSuccess: () => {
            updateFluxQuantity([value, id], {
              onSuccess: () => {
                console.log("Flux updated");
              },
            });
          },
        }
      );
    }
  };

  const checkAttributeExistence = () => {
    if (form.values.product !== "" && form.values.batchNumber !== "") {
      getAttribute();
    }
  };

  const handleEditFluxObservationInLine = (id: string, value: string) => {
    updateFluxObservation([value, id], {
      onSuccess: () => {
        console.log("Flux updated");
      },
    });
  };

  const handleSetDefaultValues = useCallback((flux: ProductOperationFlux) => {
    form.setValues((currentValues) => ({
      ...currentValues,
      product: flux.product.uuid,
      quantity: flux.quantity.toString(),
      batchNumber: Fn.extractInformation(
        flux.attributes,
        flux.product.uuid,
        "attribute"
      ).batchNumber,
      expiryDate: dayjs(
        Fn.extractInformation(flux.attributes, flux.product.uuid, "attribute")
          .expiryDate
      ).toDate(),
      observation: flux.observation ? flux.observation : "",
      uuid: fluxUuid,
    }));
  }, []);

  const hiddenColumns = ["AttributeUuid", "Uuid"];

  if (
    !INVENTORY_EDIT_COLUMNS.some(
      (c) => c.Header === "Quantité Physique" || c.Header === "Observations"
    )
  ) {
    INVENTORY_EDIT_COLUMNS.push(
      {
        Header: "Quantité Physique",
        accessor: (data: ProductOperationFlux) => data.quantity,
        width: 100,
        Cell: (data: any) => {
          return (
            <EditableCell
              value={data.row.values["Quantité Physique"]}
              column={{
                id: data.row.values["Uuid"],
                attribute: data.row.values["AttributeUuid"],
              }}
              updateData={handleEditFluxQuantityInLine}
            />
          );
        },
      },
      {
        Header: "Observations",
        accessor: (data: ProductOperationFlux) => data.observation,
        width: 250,
        Cell: (data: any) => {
          const value = data.row.values["Observations"]
            ? data.row.values["Observations"]
            : "";
          return (
            <EditableCell
              value={value}
              column={{
                id: data.row.values["Uuid"],
                attribute: data.row.values["AttributeUuid"],
              }}
              updateData={handleEditFluxObservationInLine}
            />
          );
        },
      }
    );
  }

  const columns = useMemo(
    () =>
      inventory && inventory.operationStatus === "NOT_COMPLETED"
        ? INVENTORY_EDIT_COLUMNS
        : INVENTORY_COLUMNS,
    [inventory]
  );

  const fluxes: ProductOperationFlux[] = useMemo(
    () => (inventory ? inventory.fluxes : []),
    [inventory]
  );

  // console.log(inventory);

  useEffect(() => {
    if (fluxUuid !== "") {
      findFlux();
      if (flux) {
        handleSetDefaultValues(flux);
        setAttributeUuid(
          Fn.extractInformation(flux.attributes, flux.product.uuid, "attribute")
            .uuid
        );
        setFluxAttributeUuid(
          Fn.extractInformation(flux.attributes, flux.product.uuid, "uuid")
        );
      }
    }
    if (inventory && inventory.attributes) {
      const extractedInventoryType = Fn.getAttributeValue(
        inventory.attributes,
        "INVENTORYTYPEAAAAAAAAAAAAAAAAAAAAAAAAA"
      );
      if (extractedInventoryType) {
        setInventoryType(extractedInventoryType);
      }
    }
    if (attribute) {
      setAttributeAlreadyExist(true);
      setToolTipText(
        `Le numero de lot appartient aux produit : ${attribute.batchNumber} - (${attribute.product.code}) ${attribute.product.dispensationName}`
      );
    }
  }, [fluxUuid, inventory, attribute, findFlux, flux, handleSetDefaultValues]);

  const createAttributeFromForm = (
    values: typeof form["values"]
  ): ProductAttributeSave => {
    return {
      product: values.product,
      batchNumber: values.batchNumber,
      expiryDate: dayjs(values.expiryDate).toDate(),
      location: inventory?.location.uuid,
    };
  };

  const createFluxFromForm = (
    values: typeof form["values"]
  ): ProductOperationFluxSave => {
    return {
      product: values.product,
      quantity: parseInt(values.quantity),
      location: inventory?.location.uuid,
      observation: values.observation,
      // attributes: [],
    };
  };

  const saveOperation = () => {
    updateOperationStatus(
      { status: "AWAITING_VALIDATION", uuid: inventoryUuid },
      {
        onSuccess: () => {
          navigate(`/supply/inventory`);
        },
      }
    );
  };

  const validateOperation = () => {
    updateOperationStatus(
      { status: "VALIDATED", uuid: inventoryUuid },
      {
        onSuccess: () => {
          navigate(`/supply/inventory`);
        },
      }
    );
  };
  const removeCurrentOperation = () => {
    removeOperation(inventoryUuid, {
      onSuccess: () => {
        queryClient.invalidateQueries("inventory");
        navigate("/supply/inventory");
      },
    });
  };
  const editOperation = () => {
    updateOperationStatus(
      { status: "NOT_COMPLETED", uuid: inventoryUuid },
      {
        onSuccess: (i) => {
          refetchInventory();
        },
      }
    );
  };

  // const handleEditFlux = useCallback((value: string) => {
  //   setFluxUuid(value);
  // }, []);

  const handleDeleteFlux = (value: string) => {
    removeFlux(value, {
      onSuccess: () => {
        // refetch();
        refetchInventory();
      },
    });
  };

  const openConfirmModal = (value: string) =>
    modals.openConfirmModal({
      title: "Confirmer la suppression",
      children: (
        <Text size="sm">
          Vous êtes sur le point de supprimer le produit, voulez vous confirmer
          ?
        </Text>
      ),
      labels: { confirm: "Supprimer", cancel: "Annuler" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => handleDeleteFlux(value),
    });

  const handleSubmit = (values: typeof form["values"]) => {
    console.log(values);
    if (form.validate()) {
      const flux = createFluxFromForm(values);
      const productAttribute = createAttributeFromForm(values);

      if (!fluxUuid) {
        createAttribute(productAttribute, {
          onSuccess: (data) => {
            if (data && data.uuid) {
              flux.attributes = [
                {
                  quantity: flux.quantity,
                  attribute: data.uuid,
                  location: flux.location,
                },
              ];

              addFlux(flux, {
                onSuccess: () => {
                  refetchInventory();
                  form.reset();
                },
              });
            }
          },
        });
      } else {
        updateAttribute(
          { attribute: productAttribute, attributeUuid },
          {
            onSuccess: () => {
              updateFlux(
                { flux, fluxUuid },
                {
                  onSuccess: (fs) => {
                    updateFluxAttribute(
                      {
                        value: { quantity: fs.quantity },
                        attributeUuid: fluxAttributeUuid,
                      },
                      {
                        onSuccess: () => {
                          refetchInventory();
                          // form.setFieldValue("expiryDate", "");
                          // queryClient.cancelQueries(["operation-fluxes", inventory.uuid]);
                          form.reset();
                          setFluxUuid("");
                          setFluxAttributeUuid("");
                          setAttributeUuid("");
                          // setProductUuid("");
                        },
                      }
                    );
                  },
                }
              );
            },
          }
        );
      }
    }
  };

  const tableHooks = (hooks: any) => {
    hooks.visibleColumns.push((columns: any) => [
      ...columns,
      {
        id: "Menu",
        Header: "",
        with: 10,
        maxWidth: 10,
        Cell: (data: any) => (
          <div style={{ textAlign: "right" }}>
            <Menu /* style={{ maxWidth: 120 }} */>
              <Menu.Item
                icon={<FontAwesomeIcon icon={faEdit} />}
                onClick={() => setFluxUuid(data.row.values.Uuid)}
              >
                Modifier
              </Menu.Item>
              <Menu.Item
                icon={<FontAwesomeIcon icon={faTrash} />}
                onClick={() => openConfirmModal(data.row.values.Uuid)}
              >
                Supprimer
              </Menu.Item>
            </Menu>
          </div>
        ),
      },
    ]);
  };

  return (
    <>
      {inventory !== undefined && (
        <Card
          shadow={"xs"}
          style={{
            width: "100%",
            backgroundColor: "#efefef",
            border: "1px solid green",
            textAlign: "right",
          }}
          color="green"
          // p={"xs"}
          mt={"xs"}
        >
          <Group position="right" spacing={"xs"}>
            <Button
              onClick={() => {
                navigate("/supply/inventory");
              }}
              leftIcon={<FontAwesomeIcon icon={faList} />}
            >
              Retour
            </Button>
            {inventory.operationStatus === "AWAITING_VALIDATION" && (
              <>
                <Button
                  leftIcon={<FontAwesomeIcon icon={faCheckCircle} />}
                  onClick={validateOperation}
                  color="indigo"
                >
                  Valider
                </Button>
                <Button
                  leftIcon={<FontAwesomeIcon icon={faEdit} />}
                  onClick={editOperation}
                  color="green"
                >
                  Modifier
                </Button>
              </>
            )}

            {inventory?.operationStatus === "NOT_COMPLETED" && (
              <Button onClick={saveOperation}>Terminer</Button>
            )}
            {inventory?.operationStatus !== "VALIDATED" && (
              <Button
                leftIcon={<FontAwesomeIcon icon={faTrash} />}
                color={"red"}
                onClick={removeCurrentOperation}
              >
                Supprimer
              </Button>
            )}
          </Group>
        </Card>
      )}

      <Card
        shadow={"xs"}
        style={{
          width: "100%",
          backgroundColor: "#efefef",
          border: "1px solid green",
        }}
        color="green"
        // p={"xs"}
        mt={"xs"}
      >
        {inventory !== undefined && (
          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <CustomTable
              data={fluxes}
              columns={columns}
              initialState={{ hiddenColumns }}
              tableHooks={
                inventory.operationStatus !== "NOT_COMPLETED"
                  ? undefined
                  : tableHooks
              }
              form={
                inventory.operationStatus === "NOT_COMPLETED" &&
                inventoryType &&
                (inventoryType !== "PARTIAL" ||
                  (inventoryType === "PARTIAL" &&
                    inventory.fluxes.length < 5)) ? (
                  <tr style={{ backgroundColor: "#eee" }}>
                    <td colSpan={3}>
                      <Select
                        searchable
                        nothingFound="Aucun produit trouvé"
                        placeholder="Choix du produit"
                        maxDropdownHeight={280}
                        icon={<FontAwesomeIcon icon={faLeaf} />}
                        data={productSelectList}
                        {...form.getInputProps("product")}
                        onBlur={checkAttributeExistence}
                      />
                    </td>
                    <td>
                      <Tooltip
                        label={toolTipText}
                        opened={attributeAlreadyExist}
                        color="red"
                        openDelay={500}
                        withArrow
                        wrapLines
                        transition="rotate-left"
                        transitionDuration={250}
                        width={220}
                      >
                        <TextInput
                          {...form.getInputProps("batchNumber")}
                          onBlur={checkAttributeExistence}
                        />
                      </Tooltip>
                    </td>
                    <td>
                      <DatePicker
                        // required
                        inputFormat="DD/MM/YYYY"
                        icon={<FontAwesomeIcon icon={faCalendar} />}
                        minDate={dayjs(new Date()).toDate()}
                        {...form.getInputProps("expiryDate")}
                      />
                    </td>
                    <td>
                      <TextInput {...form.getInputProps("quantity")} />
                    </td>
                    <td>
                      <TextInput {...form.getInputProps("observation")} />
                    </td>
                    <td style={{ width: 10, textAlign: "right" }}>
                      <Button type="submit" color={fluxUuid ? "green" : ""}>
                        <FontAwesomeIcon icon={fluxUuid ? faEdit : faSave} />
                      </Button>
                    </td>
                  </tr>
                ) : undefined
              }
            />
          </form>
        )}
      </Card>
    </>
  );
};

export default InventoryProductForm;
