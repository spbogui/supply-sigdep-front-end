import { useForm } from "@mantine/form";
import { useModals } from "@mantine/modals";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useFindOperation, useOperationMutation } from "../../hooks/operation";
import {
  useFindProduct,
  useFindProductAttributeBatchNumber,
  useProductAttributeMutation,
  useProgramProducts,
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
  Menu,
  Select,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useFindFlux, useFluxMutation } from "../../hooks/flux";
import { Fn } from "../../utils/Fn";
import dayjs from "dayjs";
import { TRANSFER_EDIT_COLUMNS } from "../tables/columns/transfer";
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
import { ProductAttributeSave } from "../../models/Product";
import { useInputState } from "@mantine/hooks";
import { DatePicker } from "@mantine/dates";
import CustomTable from "../tables/CustomTable";

type TransferInFluxFormProps = {
  transferUuid: string;
  program: string;
};
const TransferInFluxForm = (props: TransferInFluxFormProps) => {
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
  const [quantityErrorMessage, setQuantityErrorMessage] =
    useInputState<string>("");

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

  const { operation: transfer, getOperation: refetchTransfer } =
    useFindOperation(transferUuid);

  // console.log(transfer);

  const { attribute, getAttribute } = useFindProductAttributeBatchNumber(
    form.values.batchNumber,
    form.values.product
  );

  const parentFluxAttributes = useMemo(
    () =>
      transfer &&
      transfer.parentOperation &&
      transfer.parentOperation.fluxAttributes
        ? transfer.parentOperation.fluxAttributes
        : [],
    [transfer]
  );

  const { productSelectList } = useProgramProducts(program);

  const { flux, findFlux } = useFindFlux(fluxUuid, transferUuid, "transfer");

  const { product, getProduct } = useFindProduct(productUuid);

  // Mutations

  const { createAttribute, updateAttribute } = useProductAttributeMutation();
  const {
    addFlux,
    removeFlux,
    updateFluxAttribute,
    updateFluxObservation,
    updateFluxQuantity,
    updateFlux,
  } = useFluxMutation(transferUuid);

  const { updateOperationStatus, removeOperation } = useOperationMutation();

  const handleEditFluxQuantityInLine =
    /* useCallback( */
    (id: string, value: number, attribute?: string) => {
      setQuantityErrorMessage("");
      if (value.toString().length === 0 || value === 0) {
        setQuantityErrorMessage("Quantité requise");
      } else {
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
      }
    };

  const handleEditFluxObservationInLine = (id: string, value: string) => {
    updateFluxObservation([value, id], {
      onSuccess: () => {
        console.log("Flux updated");
      },
    });
  };

  const checkAttributeExistence = () => {
    if (form.values.product !== "") {
      setProductUuid(form.values.product);

      if (form.values.batchNumber !== "") {
        if (transfer && transfer.fluxes.length > 0) {
          if (
            transfer.fluxes.some(
              (flux) =>
                // flux.product.uuid !== form.values.product &&
                (fluxUuid === "" || flux.uuid !== fluxUuid) &&
                Fn.extractInformation(
                  flux.attributes,
                  flux.product.uuid,
                  "attribute"
                ).batchNumber === form.values.batchNumber
            )
          ) {
            // console.log("Already exist");
            setAttributeAlreadyExist(true);
            setToolTipText(
              `Le numero de lot appartient à un produit de la liste en cours`
            );
          } else {
            setAttributeAlreadyExist(false);
            setToolTipText("");
            getAttribute();
          }
        }
      }
    } else {
      setProductUuid("");
    }
  };

  const handleSetDefaultValues =
    /* useCallback( */
    (flux: ProductOperationFlux) => {
      form.setValues((currentValues) => ({
        ...currentValues,
        product: flux.product.uuid,
        quantity: flux.quantity.toString(),
        relatedQuantity: flux.quantity.toString(),
        uuid: flux.uuid ? flux.uuid : "",
      }));
    }; /* ,
  [form]
) */

  const hiddenColumns = ["AttributeUuid", "Uuid"];

  const columns = useMemo(() => {
    TRANSFER_EDIT_COLUMNS.splice(5, 3);
    // console.log(RECEPTION_EDIT_COLUMNS);
    TRANSFER_EDIT_COLUMNS.push(
      {
        Header: "Quantité",
        accessor: (data: ProductOperationFlux) => data.relatedQuantity,
        width: 100,
        Cell: (data: any) =>
          transfer && transfer.operationStatus !== "VALIDATED" ? (
            <EditableCell
              value={data.row.values["Quantité"]}
              column={{
                id: data.row.values["Uuid"],
                attribute: data.row.values["AttributeUuid"],
              }}
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
  }, [transfer]);

  // console.log(columns);

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
  }, [flux]);

  useEffect(() => {
    if (fluxUuid !== "") {
      findFlux();
      handleLoadFluxInfo();
    }
    if (attribute) {
      setAttributeAlreadyExist(true);
      setToolTipText(
        `Le numero de lot appartient aux produit : ${attribute.batchNumber} - 
        (${attribute.product.code}) ${attribute.product.dispensationName}`
      );
    }
    if (productUuid) {
      getProduct();
    }
  }, [
    fluxUuid,
    attribute,
    findFlux,
    flux,
    productUuid,
    getProduct,
    handleLoadFluxInfo,
    parentFluxAttributes,
  ]);

  const createAttributeFromForm = (
    values: typeof form["values"]
  ): ProductAttributeSave => {
    // console.log(
    //   values.expiryDate,
    //   dayjs(
    //     dayjs(values.expiryDate, "DD/MM/YYYY").format("DD/MM/YYYY")
    //   ).toDate()
    // );
    return {
      product: values.product,
      batchNumber: values.batchNumber,
      expiryDate: dayjs(values.expiryDate).toDate(),
      location: transfer?.location.uuid,
    };
  };

  const createFluxFromForm = (
    values: typeof form["values"]
  ): ProductOperationFluxSave => {
    return {
      product: values.product,
      quantity: parseInt(values.quantity),
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

  const handleEditFlux = useCallback((value: string) => {
    setFluxUuid(() => value);
  }, []);

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
    // console.log(values);
    // console.log(product);
    if (form.validate() && product) {
      const conversionUnit =
        transfer?.quantityType === "DISPENSATION" ? 1 : product.conversionUnit;
      const flux = createFluxFromForm(values);
      const attribute = createAttributeFromForm(values);
      if (!fluxUuid) {
        createAttribute(attribute, {
          onSuccess: (data) => {
            if (data && data.uuid) {
              flux.attributes = [
                {
                  quantity: flux.quantity * conversionUnit,
                  attribute: data.uuid,
                  location: flux.location,
                },
              ];

              addFlux(flux, {
                onSuccess: () => {
                  // refetch();
                  refetchTransfer();
                  form.reset();
                },
              });
            }
          },
        });
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
              <Menu.Item
                icon={<FontAwesomeIcon icon={faEdit} />}
                onClick={() => handleEditFlux(data.row.values.Uuid)}
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
          <Group position="right">
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
                transfer.operationStatus === "NOT_COMPLETED" &&
                transfer.observation !==
                  `Depuis le transfert out N ${transfer.operationNumber}` ? (
                  <tr style={{ backgroundColor: "#eee" }}>
                    <td colSpan={3}>
                      <Select
                        // required
                        searchable
                        nothingFound="Aucun produit trouvé"
                        placeholder="Choix du produit"
                        maxDropdownHeight={280}
                        icon={<FontAwesomeIcon icon={faLeaf} />}
                        data={productSelectList}
                        {...form.getInputProps("product")}
                        onBlur={checkAttributeExistence}
                        // onChange={(e) => console.log(e)}
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
                        inputFormat="DD/MM/YYYY"
                        locale="fr"
                        icon={<FontAwesomeIcon icon={faCalendar} />}
                        minDate={dayjs(new Date()).add(1, "day").toDate()}
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

export default TransferInFluxForm;
