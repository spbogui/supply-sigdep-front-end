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
import { useInputState } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useFindFlux, useFluxMutation } from "../../hooks/flux";
import { useFindOperation, useOperationMutation } from "../../hooks/operation";
import {
  useFindProduct,
  useFindProductAttributeBatchNumber,
  useProductAttributeMutation,
  useProgramProducts,
} from "../../hooks/product";
import { ProductAttributeSave } from "../../models/Product";
import {
  ProductOperationFlux,
  ProductOperationFluxSave,
} from "../../models/ProductOperation";
import { Fn } from "../../utils/Fn";
import { RECEPTION_EDIT_COLUMNS } from "../tables/columns/reception";
import CustomTable from "../tables/CustomTable";
import { EditableCell } from "../tables/EditableCell";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

type ReceptionFluxFormProps = {
  receptionUuid: string;
  program: string;
};

dayjs.locale("fr");

const ReceptionFluxForm = (props: ReceptionFluxFormProps) => {
  const { receptionUuid, program } = props;

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
  // const [maxQuantity, setMaxQuantity] = useInputState<number>(0);

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
          : // : parseInt(values.quantity) > maxQuantity && maxQuantity > 0
            // ? "Quantité > reçue"
            null,
      relatedQuantity:
        values.relatedQuantity === undefined ||
        values.relatedQuantity.length === 0
          ? "Champ requis"
          : parseInt(values.relatedQuantity) === 0
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

  const { operation: reception, getOperation: refetchReception } =
    useFindOperation(receptionUuid);

  // console.log(reception);

  const { attribute, getAttribute } = useFindProductAttributeBatchNumber(
    form.values.batchNumber,
    form.values.product
  );

  const parentFluxAttributes = useMemo(
    () =>
      reception &&
      reception.parentOperation &&
      reception.parentOperation.fluxAttributes
        ? reception.parentOperation.fluxAttributes
        : [],
    [reception]
  );

  const columnsToPush = useMemo(
    () => [
      {
        Header: "Quantité livrée",
        accessor: (data: ProductOperationFlux) => data.relatedQuantity,
        width: 100,
        Cell: (data: any) =>
          reception && reception.operationStatus === "NOT_COMPLETED" ? (
            <EditableCell
              value={data.row.values["Quantité livrée"]}
              column={{
                id: data.row.values["Uuid"],
                attribute: data.row.values["AttributeUuid"],
              }}
              updateData={handleEditFluxRelatedQuantityInLine}
            />
          ) : (
            <Text style={{ textAlign: "center" }} size={"sm"}>
              {data.row.values["Quantité livrée"]}
            </Text>
          ),
      },
      {
        Header: "Quantité reçue",
        accessor: (data: ProductOperationFlux) => data.quantity,
        width: 100,
        Cell: (data: any) =>
          reception && reception.operationStatus === "NOT_COMPLETED" ? (
            <EditableCell
              value={data.row.values["Quantité reçue"]}
              column={{
                id: data.row.values["Uuid"],
                attribute: data.row.values["AttributeUuid"],
              }}
              updateData={handleEditFluxQuantityInLine}
            />
          ) : (
            <Text style={{ textAlign: "center" }} size={"sm"}>
              {data.row.values["Quantité reçue"]}
            </Text>
          ),
      },
    ],
    []
  );

  // console.log(parentFluxAttributes);

  const { productSelectList } = useProgramProducts(program);

  const { flux, findFlux } = useFindFlux(fluxUuid, receptionUuid, "reception");

  const { product, getProduct } = useFindProduct(productUuid);

  // Mutations

  const { createAttribute, updateAttribute } = useProductAttributeMutation();
  const {
    addFlux,
    removeFlux,
    updateFluxAttribute,
    updateFluxObservation,
    updateFluxQuantity,
    updateFluxRelatedQuantity,
    updateFlux,
  } = useFluxMutation(receptionUuid);

  const { updateOperationStatus, removeOperation } = useOperationMutation();

  const handleEditFluxQuantityInLine =
    /* useCallback( */
    (id: string, value: number, attribute?: string) => {
      setQuantityErrorMessage("");
      if (value.toString().length === 0) {
        setQuantityErrorMessage("Quantité requise");
      } else if (/* value > maxQuantity ||  */ value === 0) {
        setQuantityErrorMessage("Quantité entre > 0");
        // console.log(quantityErrorMessage);
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
    }; /* ,
    [
      maxQuantity,
      quantityErrorMessage,
      setQuantityErrorMessage,
      updateFluxAttribute,
      updateFluxQuantity,
    ]
  ) */

  const handleEditFluxRelatedQuantityInLine = (
    id: string,
    value: number,
    attribute?: string
  ) => {
    if (attribute) {
      updateFluxAttribute(
        { value: { quantity: value }, attributeUuid: attribute },
        {
          onSuccess: () => {
            updateFluxRelatedQuantity([value, id], {
              onSuccess: () => {
                console.log("Flux updated");
              },
            });
          },
        }
      );
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
        if (reception && reception.fluxes.length > 0) {
          if (
            reception.fluxes.some(
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
        uuid: flux.uuid ? flux.uuid : "",
      }));
    }; /* ,
    [form]
  ) */

  const hiddenColumns = ["AttributeUuid", "Uuid"];

  const columns = useMemo(() => {
    RECEPTION_EDIT_COLUMNS.splice(5, 3);
    // console.log(RECEPTION_EDIT_COLUMNS);
    if (
      !RECEPTION_EDIT_COLUMNS.some(
        (c) =>
          // c.Header === "Quantité Livrée" ||
          // c.Header === "Quantité retournée" ||
          // c.Header === "Quantité reçue" ||
          c.Header === "Observations"
      )
    ) {
      // if (isReturnReception) {
      //   RECEPTION_EDIT_COLUMNS.push(...columnsToPushToReturn);
      // } else {
      // }
      RECEPTION_EDIT_COLUMNS.push(...columnsToPush);
    }
    RECEPTION_EDIT_COLUMNS.push({
      Header: "Observations",
      accessor: (data: ProductOperationFlux) => data.observation,
      width: 250,
      Cell: (data: any) => {
        const value = data.row.values["Observations"]
          ? data.row.values["Observations"]
          : "";
        return reception && reception.operationStatus === "NOT_COMPLETED" ? (
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
    });
    return RECEPTION_EDIT_COLUMNS;
  }, [
    columnsToPush,
    // columnsToPushToReturn,
    handleEditFluxObservationInLine,
    // isReturnReception,
    reception,
  ]);

  // console.log(columns);

  const fluxes: ProductOperationFlux[] = useMemo(
    () => (reception ? reception.fluxes : []),
    [reception]
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
        `Le numero de lot appartient aux produit : ${attribute.batchNumber} - (${attribute.product.code}) ${attribute.product.dispensationName}`
      );
    }
    if (productUuid) {
      getProduct();
    }
    // if (productSelected !== "") {
    //   const attributeFlux = parentFluxAttributes.find(
    //     (p) => p.attribute.batchNumber === productSelected
    //   );
    //   if (attributeFlux) {
    //     setProductUuid(attributeFlux.attribute.product.uuid);
    //     setMaxQuantity(attributeFlux.quantity);
    //     setAttributeUuid(attributeFlux.attribute.uuid);
    //     form.setValues((currentValues) => ({
    //       ...currentValues,
    //       product: attributeFlux.attribute.product.uuid,
    //       relatedQuantity:
    //         reception && reception.quantityType === "PACKAGING"
    //           ? (
    //               attributeFlux.quantity /
    //               attributeFlux.attribute.product.conversionUnit
    //             ).toString()
    //           : attributeFlux.quantity.toString(),
    //       batchNumber: productSelected,
    //       expiryDate: dayjs(attributeFlux.attribute.expiryDate).format(
    //         "DD/MM/YYYY"
    //       ),
    //     }));
    //   }
    // }
  }, [
    fluxUuid,
    attribute,
    findFlux,
    flux,
    productUuid,
    getProduct,
    handleLoadFluxInfo,
    // productSelected,
    parentFluxAttributes,
    // form,
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
      location: reception?.location.uuid,
    };
  };

  const createFluxFromForm = (
    values: typeof form["values"]
  ): ProductOperationFluxSave => {
    return {
      product: values.product,
      quantity: parseInt(values.quantity),
      relatedQuantity: parseInt(values.relatedQuantity),
      location: reception?.location.uuid,
      observation: values.observation,
      // attributes: [],
    };
  };

  const saveOperation = () => {
    updateOperationStatus(
      { status: "AWAITING_VALIDATION", uuid: receptionUuid },
      {
        onSuccess: () => {
          navigate(`/supply/reception`);
        },
      }
    );
  };

  const validateOperation = () => {
    updateOperationStatus(
      { status: "VALIDATED", uuid: receptionUuid },
      {
        onSuccess: () => {
          navigate(`/supply/reception`);
        },
      }
    );
  };
  const removeCurrentOperation = () => {
    removeOperation(receptionUuid, {
      onSuccess: () => {
        queryClient.invalidateQueries("reception");
        navigate("/supply/reception");
      },
    });
  };
  const editOperation = () => {
    updateOperationStatus(
      { status: "NOT_COMPLETED", uuid: receptionUuid },
      {
        onSuccess: (i) => {
          refetchReception();
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
        refetchReception();
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
        reception?.quantityType === "DISPENSATION" ? 1 : product.conversionUnit;
      const flux = createFluxFromForm(values);

      // if (isReturnReception) {
      //   flux.attributes = [
      //     {
      //       quantity: flux.quantity * conversionUnit,
      //       attribute: attributeUuid,
      //       location: flux.location,
      //     },
      //   ];

      //   addFlux(flux, {
      //     onSuccess: () => {
      //       refetchReception();
      //       setProductSelected("");
      //       form.reset();
      //     },
      //   });
      // } else {
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
                  refetchReception();
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
                          refetchReception();
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
      // }
    }
  };

  console.log(reception);

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
              {/* {!isReturnReception && (
              )} */}
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
      {reception !== undefined && (
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
            {/* {isReturnReception && (
              <Badge color={"green"} size={"lg"}>
                RETOUR DE PRODUITS
              </Badge>
            )} */}
            <Group position="apart">
              <Button
                onClick={() => {
                  navigate("/supply/reception");
                }}
                leftIcon={<FontAwesomeIcon icon={faList} />}
              >
                Retour
              </Button>
              {reception.operationStatus === "AWAITING_VALIDATION" && (
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

              {reception?.operationStatus === "NOT_COMPLETED" && (
                <Button onClick={saveOperation}>Terminer</Button>
              )}
              {reception?.operationStatus !== "VALIDATED" && (
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
        {reception && (
          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <CustomTable
              data={fluxes}
              columns={columns}
              initialState={{ hiddenColumns }}
              tableHooks={
                reception.operationStatus !== "NOT_COMPLETED"
                  ? undefined
                  : tableHooks
              }
              form={
                reception.operationStatus === "NOT_COMPLETED" /* ||
                (isReturnReception &&
                  productSelectListReturn.length !== 0 &&
                  reception.observation !==
                    `Depuis la distribution ${reception.operationNumber}`) */ ? (
                  <tr style={{ backgroundColor: "#eee" }}>
                    <td colSpan={3}>
                      {/* {isReturnReception && (
                        <>
                          <Select
                            // required
                            searchable
                            nothingFound="Aucun produit trouvé"
                            placeholder="Choix du produit"
                            maxDropdownHeight={280}
                            icon={<FontAwesomeIcon icon={faLeaf} />}
                            data={
                              isReturnReception
                                ? productSelectListReturn
                                : productSelectList
                            }
                            value={productSelected}
                            onChange={setProductSelected}
                          />
                          <Input
                            type={"hidden"}
                            {...form.getInputProps("product")}
                          />
                        </>
                      )} */}
                      {/* {!isReturnReception && (
                      )} */}
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
                          // readOnly={isReturnReception}
                        />
                      </Tooltip>
                    </td>
                    <td>
                      {/* {isReturnReception ? (
                        <TextInput
                          readOnly
                          // disabled
                          {...form.getInputProps("expiryDate")}
                        />
                      ) : (
                      )} */}
                      <DatePicker
                        inputFormat="DD/MM/YYYY"
                        locale="fr"
                        icon={<FontAwesomeIcon icon={faCalendar} />}
                        minDate={dayjs(new Date()).add(1, "day").toDate()}
                        {...form.getInputProps("expiryDate")}
                      />
                    </td>
                    <td>
                      <TextInput
                        // readOnly={isReturnReception}
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

export default ReceptionFluxForm;
