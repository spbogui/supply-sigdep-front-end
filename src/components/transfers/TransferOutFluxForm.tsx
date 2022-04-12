import { useForm } from "@mantine/form";
import { useInputState } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useFindOperation, useOperationMutation } from "../../hooks/operation";
import {
  useFindProduct,
  useFindProductAttributeBatchNumber,
  useProductAttributeMutation,
} from "../../hooks/product";
import {
  ProductOperationFlux,
  ProductOperationFluxSave,
} from "../../models/ProductOperation";
import { EditableCell } from "../tables/EditableCell";
import {
  Button,
  Card,
  Group,
  Input,
  Menu,
  Select,
  SelectItem,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useFindFlux, useFluxMutation } from "../../hooks/flux";
import { Fn } from "../../utils/Fn";
import dayjs from "dayjs";
import { TRANSFER_EDIT_COLUMNS } from "../tables/columns/transfer";
import {
  faCheckCircle,
  faEdit,
  faLeaf,
  faList,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFindAvailableSocks } from "../../hooks/stock";
import CustomTable from "../tables/CustomTable";

type TransferOutFluxFormProps = {
  transferUuid: string;
  program: string;
};

const TransferOutFluxForm = (props: TransferOutFluxFormProps) => {
  const { transferUuid, program } = props;
  const navigate = useNavigate();
  const modals = useModals();
  const queryClient = useQueryClient();

  const [fluxUuid, setFluxUuid] = useState<string>("");
  const [fluxAttributeUuid, setFluxAttributeUuid] = useState<string>("");
  const [productUuid, setProductUuid] = useState<string>("");
  const [attributeUuid, setAttributeUuid] = useState<string>("");
  // const [batchNumber, setBatchNumber] = useState<string>("");
  const [toolTipText, setToolTipText] = useState<string>("Rien a dire");
  const [attributeAlreadyExist, setAttributeAlreadyExist] =
    useState<boolean>(false);
  const [productSelected, setProductSelected] = useInputState<string>("");
  const [quantityErrorMessage, setQuantityErrorMessage] =
    useInputState<string>("");
  const [maxQuantity, setMaxQuantity] = useInputState<number>(0);
  const [currentFluxBatchNumbers, setCurrentFluxBatchNumbers] = useState<
    string[]
  >([]);

  const form = useForm<{
    product: string;
    batchNumber: string;
    quantity: string;
    relatedQuantity: string;
    expiryDate: Date | string;
    observation: string | undefined;
    uuid: string | undefined;
  }>({
    initialValues: {
      product: "",
      batchNumber: "",
      quantity: "",
      relatedQuantity: "",
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
          : parseInt(values.quantity) > maxQuantity && maxQuantity > 0
          ? "Quantité > reçue"
          : null,
      relatedQuantity:
        values.relatedQuantity === undefined ||
        values.relatedQuantity.length === 0
          ? "Champ requis"
          : parseInt(values.relatedQuantity) === 0
          ? "Quantité > 0"
          : null,

      expiryDate: !values.expiryDate ? "Champ requis" : null,
    }),
  });

  const { operation: transfer, getOperation: refetchTransfer } =
    useFindOperation(transferUuid);

  // console.log(transfer);

  const { attribute, getAttribute } = useFindProductAttributeBatchNumber(
    form.values.batchNumber,
    form.values.product
  );

  const { availableStock } = useFindAvailableSocks(
    program,
    currentFluxBatchNumbers
  );

  const productSelectList = useMemo(
    () =>
      availableStock.length > 0
        ? availableStock.reduce((acc: SelectItem[], stock) => {
            if (transfer) {
              if (
                !transfer.fluxAttributes ||
                !transfer.fluxAttributes.some(
                  (fa) =>
                    fa.attribute.batchNumber === stock.attribute.batchNumber
                )
              ) {
                acc.push({
                  value: stock.attribute.batchNumber,
                  label: `${stock.attribute.product.dispensationName} - [${stock.attribute.batchNumber}]`,
                });
              }
            }
            return acc;
          }, [])
        : [],
    [availableStock, transfer]
  );

  // console.log("productSelectListReturn", productSelectListReturn);

  const { flux, findFlux } = useFindFlux(fluxUuid, transferUuid, "transfer");

  const { product, getProduct } = useFindProduct(productUuid);

  // Mutations

  const { updateAttribute } = useProductAttributeMutation();
  const {
    addFlux,
    removeFlux,
    updateFluxAttribute,
    updateFluxObservation,
    updateFluxQuantity,
    updateFlux,
  } = useFluxMutation(transferUuid);

  const { updateOperationStatus, removeOperation } = useOperationMutation();

  const handleEditFluxQuantityInLine = useCallback(
    (id: string, value: number, attributeUuid?: string) => {
      setQuantityErrorMessage("");
      if (value.toString().length === 0) {
        setQuantityErrorMessage("Quantité requise");
      } else if (value > maxQuantity || value === 0) {
        setQuantityErrorMessage("Quantité entre [1 .. " + maxQuantity + " ]");
        console.log(quantityErrorMessage);
      } else {
        if (attributeUuid) {
          updateFluxAttribute(
            { value: { quantity: value }, attributeUuid },
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
      }
    },
    [
      maxQuantity,
      quantityErrorMessage,
      setQuantityErrorMessage,
      updateFluxAttribute,
      updateFluxQuantity,
    ]
  );

  const handleEditFluxObservationInLine = (id: string, value: string) => {
    updateFluxObservation([value, id], {
      onSuccess: () => {
        console.log("Flux updated");
      },
    });
  };

  const handleSetDefaultValues = useCallback(
    (flux: ProductOperationFlux) => {
      if (form.values.uuid !== flux.uuid) {
        form.setValues((currentValues) => ({
          ...currentValues,
          product: flux.product.uuid,
          quantity: flux.quantity.toString(),
          relatedQuantity: flux.quantity.toString(),
          batchNumber: Fn.extractInformation(
            flux.attributes,
            flux.product.uuid,
            "attribute"
          ).batchNumber,
          expiryDate: dayjs(
            Fn.extractInformation(
              flux.attributes,
              flux.product.uuid,
              "attribute"
            ).expiryDate
          ).toDate(),
          observation: flux.observation ? flux.observation : "",
          uuid: flux.uuid ? flux.uuid : "",
        }));
      }
    },
    [form]
  );

  const hiddenColumns = ["AttributeUuid", "Uuid"];

  const columns = useMemo(() => {
    TRANSFER_EDIT_COLUMNS.splice(5, 3);
    // console.log(RECEPTION_EDIT_COLUMNS);
    TRANSFER_EDIT_COLUMNS.push(
      {
        Header: "Quantité en stock",
        accessor: (data: ProductOperationFlux) => data.relatedQuantity,
        width: 100,
        Cell: (data: any) => {
          return (
            <Text style={{ textAlign: "center" }} size={"sm"}>
              {data.row.values["Quantité en stock"]}
            </Text>
          );
        },
      },
      {
        Header: "Quantité",
        accessor: (data: ProductOperationFlux) => data.quantity,
        width: 100,
        Cell: (data: any) =>
          transfer && transfer.operationStatus !== "VALIDATED" ? (
            <EditableCell
              maxValue={data.row.values["Quantité en stock"]}
              value={data.row.values["Quantité"]}
              column={{
                id: data.row.values["Uuid"],
                attribute: data.row.values["AttributeUuid"],
              }}
              hasConstraints={true}
              updateData={handleEditFluxQuantityInLine}
            />
          ) : (
            <Text style={{ textAlign: "center" }} size={"sm"}>
              {data.row.values["Quantité"]}
            </Text>
          ),
      },
      {
        Header: "Observations",
        accessor: (data: ProductOperationFlux) => data.observation,
        width: 250,
        Cell: (data: any) => {
          const value = data.row.values["Observations"]
            ? data.row.values["Observations"]
            : "";
          return transfer && transfer.operationStatus !== "VALIDATED" ? (
            <EditableCell
              value={value}
              column={{
                id: data.row.values["Uuid"],
                attribute: data.row.values["AttributeUuid"],
              }}
              updateData={handleEditFluxObservationInLine}
            />
          ) : (
            <Text style={{ textAlign: "left" }} size={"sm"}>
              {value}
            </Text>
          );
        },
      }
    );
    return TRANSFER_EDIT_COLUMNS;
  }, [handleEditFluxObservationInLine, handleEditFluxQuantityInLine, transfer]);

  const fluxes: ProductOperationFlux[] = useMemo(
    () => (transfer ? transfer.fluxes : []),
    [transfer]
  );

  const handleLoadFluxInfo = useCallback(() => {
    if (flux) {
      setProductUuid(flux.product.uuid);
      handleSetDefaultValues(flux);
      setAttributeUuid(
        Fn.extractInformation(flux.attributes, flux.product.uuid, "attribute")
          .uuid
      );
      setFluxAttributeUuid(
        Fn.extractInformation(flux.attributes, flux.product.uuid, "uuid")
      );
    }
  }, [flux, handleSetDefaultValues]);

  const handleSetFormValues = useCallback(
    (productBatchNumber: string) => {
      const attributeFlux = availableStock.find(
        (p) => p.attribute.batchNumber === productBatchNumber
      );

      if (attributeFlux && attributeFlux.attribute.uuid !== attributeUuid) {
        setProductUuid(attributeFlux.attribute.product.uuid);
        setMaxQuantity(attributeFlux.quantityInStock);
        setAttributeUuid(attributeFlux.attribute.uuid);
        form.setValues((currentValues) => ({
          ...currentValues,
          product: attributeFlux.attribute.product.uuid,
          relatedQuantity:
            transfer && transfer.quantityType === "PACKAGING"
              ? (
                  attributeFlux.quantityInStock /
                  attributeFlux.attribute.product.conversionUnit
                ).toString()
              : attributeFlux.quantityInStock.toString(),
          batchNumber: productBatchNumber,
          expiryDate: dayjs(attributeFlux.attribute.expiryDate).format(
            "DD/MM/YYYY"
          ),
        }));
      }
    },
    [attributeUuid, availableStock, form, setMaxQuantity, transfer]
  );

  useEffect(() => {
    if (fluxUuid !== "") {
      findFlux();
      handleLoadFluxInfo();
    }

    if (productSelected !== "") {
      handleSetFormValues(productSelected);
    }
  }, [
    attribute,
    availableStock,
    findFlux,
    fluxUuid,
    attributeUuid,
    handleLoadFluxInfo,
    productSelected,
    productUuid,
    setMaxQuantity,
    transfer,
    handleSetFormValues,
  ]);

  useEffect(() => {
    if (productUuid !== "") {
      getProduct();
    }
    if (fluxes.length > 0) {
      const attributes = Fn.extractProductAttributes(fluxes);
      // console.log(attributes);
      setCurrentFluxBatchNumbers(
        attributes.map((attribute) => attribute.batchNumber)
      );
    }
  }, [getProduct, productUuid, fluxes]);

  const createFluxFromForm = (
    values: typeof form["values"]
  ): ProductOperationFluxSave => {
    return {
      product: values.product,
      quantity: parseInt(values.quantity),
      relatedQuantity: parseInt(values.relatedQuantity),
      location: transfer?.location.uuid,
      observation: values.observation,
      // attributes: [],
    };
  };

  const saveOperation = () => {
    updateOperationStatus(
      { status: "AWAITING_VALIDATION", uuid: transferUuid },
      {
        onSuccess: () => {
          navigate(`/supply/transfer`);
        },
      }
    );
  };

  const validateOperation = () => {
    updateOperationStatus(
      { status: "VALIDATED", uuid: transferUuid },
      {
        onSuccess: () => {
          navigate(`/supply/transfer`);
        },
      }
    );
  };
  const removeCurrentOperation = () => {
    removeOperation(transferUuid, {
      onSuccess: () => {
        queryClient.invalidateQueries("transfer");
        navigate("/supply/transfer");
      },
    });
  };
  const editOperation = () => {
    updateOperationStatus(
      { status: "NOT_COMPLETED", uuid: transferUuid },
      {
        onSuccess: (i) => {
          refetchTransfer();
        },
      }
    );
  };

  // const handleEditFlux = useCallback((value: string) => {
  //   setFluxUuid(() => value);
  // }, []);

  const handleDeleteFlux = (value: string) => {
    removeFlux(value, {
      onSuccess: () => {
        refetchTransfer();
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
    if (form.validate() && product) {
      const conversionUnit =
        transfer?.quantityType === "DISPENSATION" ? 1 : product.conversionUnit;
      const flux = createFluxFromForm(values);

      console.log(flux);
      if (!fluxUuid) {
        if (attributeUuid) {
          flux.attributes = [
            {
              quantity: flux.quantity * conversionUnit,
              attribute: attributeUuid,
              location: flux.location,
            },
          ];

          addFlux(flux, {
            onSuccess: () => {
              refetchTransfer();
              form.reset();
            },
          });
        }
      } else {
        updateAttribute(
          { attribute, attributeUuid },
          {
            onSuccess: () => {
              updateFlux(
                { flux, fluxUuid },
                {
                  onSuccess: (fs) => {
                    updateFluxAttribute(
                      {
                        value: { quantity: fs.quantity * conversionUnit },
                        attributeUuid: fluxAttributeUuid,
                      },
                      {
                        onSuccess: () => {
                          form.reset();
                          setFluxUuid("");
                          setFluxAttributeUuid("");
                          setAttributeUuid("");
                          refetchTransfer();
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
            <Menu>
              {/* <Menu.Item
                icon={<FontAwesomeIcon icon={faEdit} />}
                onClick={() => handleEditFlux(data.row.values.Uuid)}
              >
                Modifier
              </Menu.Item> */}

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
      {transfer !== undefined && (
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
          <Group position={"right"} spacing={"xs"}>
            <Group position="apart">
              <Button
                onClick={() => {
                  navigate("/supply/transfer");
                }}
                leftIcon={<FontAwesomeIcon icon={faList} />}
              >
                Retour
              </Button>
              {transfer.operationStatus === "AWAITING_VALIDATION" && (
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

              {transfer?.operationStatus === "NOT_COMPLETED" && (
                <Button onClick={saveOperation}>Terminer</Button>
              )}
              {transfer?.operationStatus !== "VALIDATED" && (
                <Button
                  leftIcon={<FontAwesomeIcon icon={faTrash} />}
                  color={"red"}
                  onClick={removeCurrentOperation}
                >
                  Supprimer
                </Button>
              )}
            </Group>
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
        mt={"xs"}
      >
        {transfer !== undefined && (
          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <CustomTable
              data={fluxes}
              columns={columns}
              initialState={{ hiddenColumns }}
              tableHooks={
                transfer.operationStatus !== "NOT_COMPLETED"
                  ? undefined
                  : tableHooks
              }
              form={
                transfer.operationStatus === "NOT_COMPLETED" ? (
                  <tr style={{ backgroundColor: "#eee" }}>
                    <td colSpan={3}>
                      <>
                        <Select
                          // required
                          searchable
                          clearable
                          nothingFound="Aucun produit trouvé"
                          placeholder="Choix du produit"
                          maxDropdownHeight={280}
                          icon={<FontAwesomeIcon icon={faLeaf} />}
                          data={productSelectList}
                          value={productSelected}
                          onChange={setProductSelected}
                        />
                        <Input
                          type={"hidden"}
                          {...form.getInputProps("product")}
                        />
                      </>
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
                          // onBlur={checkAttributeExistence}
                          readOnly
                        />
                      </Tooltip>
                    </td>
                    <td>
                      <TextInput
                        readOnly
                        // disabled
                        {...form.getInputProps("expiryDate")}
                      />
                    </td>
                    <td>
                      <TextInput
                        readOnly
                        // disabled={isReturnReception}
                        {...form.getInputProps("relatedQuantity")}
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

export default TransferOutFluxForm;
