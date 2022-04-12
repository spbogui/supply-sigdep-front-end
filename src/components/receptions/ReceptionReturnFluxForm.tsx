import {
  faCheckCircle,
  faEdit,
  faLeaf,
  faList,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Badge,
  Button,
  Card,
  Group,
  Input,
  Menu,
  Select,
  SelectItem,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useInputState } from "@mantine/hooks";
import { useModals } from "@mantine/modals";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useFindFlux, useFluxMutation } from "../../hooks/flux";
import { useFindOperation, useOperationMutation } from "../../hooks/operation";
import { useFindProduct } from "../../hooks/product";
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

const ReceptionReturnFluxForm = (props: ReceptionFluxFormProps) => {
  const { receptionUuid } = props;

  const navigate = useNavigate();
  const modals = useModals();
  const queryClient = useQueryClient();

  // const [fluxUuid, setFluxUuid] = useState<string>("");
  // const [fluxAttributeUuid, setFluxAttributeUuid] = useState<string>("");
  const [productUuid, setProductUuid] = useState<string>("");
  const [attributeUuid, setAttributeUuid] = useState<string>("");
  // const [batchNumber, setBatchNumber] = useState<string>("");
  const [productSelected, setProductSelected] = useInputState<string>("");
  const [quantityErrorMessage, setQuantityErrorMessage] =
    useInputState<string>("");
  const [maxQuantity, setMaxQuantity] = useInputState<number>(0);

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
      // batchNumber:
      //   values.batchNumber.length === 0 || values.batchNumber === ""
      //     ? "Champ requis"
      //     : attributeAlreadyExist
      //     ? "Lot existant"
      //     : null,
      expiryDate: !values.expiryDate ? "Champ requis" : null,
    }),
  });

  // Queries

  const { operation: reception, getOperation: refetchReception } =
    useFindOperation(receptionUuid);

  // console.log(reception);

  const parentFluxAttributes = useMemo(
    () =>
      reception &&
      reception.parentOperation &&
      reception.parentOperation.fluxAttributes
        ? reception.parentOperation.fluxAttributes
        : [],
    [reception]
  );

  const productSelectListReturn = useMemo(
    () =>
      parentFluxAttributes.length > 0
        ? parentFluxAttributes.reduce((acc: SelectItem[], fluxAttribute) => {
            if (reception) {
              if (
                !reception.fluxAttributes ||
                !reception.fluxAttributes.some(
                  (fa) =>
                    fa.attribute.batchNumber ===
                    fluxAttribute.attribute.batchNumber
                )
              ) {
                acc.push({
                  value: fluxAttribute.attribute.batchNumber,
                  label: `${fluxAttribute.attribute.product.dispensationName} - [${fluxAttribute.attribute.batchNumber}]`,
                });
              }
            }
            return acc;
          }, [])
        : [],
    [parentFluxAttributes, reception]
  );

  // const { flux, findFlux } = useFindFlux(fluxUuid, receptionUuid, "reception");

  const { product, getProduct } = useFindProduct(productUuid);

  // Mutations

  // const { createAttribute, updateAttribute } = useProductAttributeMutation();
  const {
    addFlux,
    removeFlux,
    updateFluxAttribute,
    updateFluxObservation,
    updateFluxQuantity,
  } = useFluxMutation(receptionUuid);

  const { updateOperationStatus, removeOperation } = useOperationMutation();

  const handleEditFluxQuantityInLine = useCallback(
    (id: string, value: number, attribute?: string) => {
      setQuantityErrorMessage("");
      if (value.toString().length === 0) {
        setQuantityErrorMessage("Quantité requise");
      } else if (value > maxQuantity || value === 0) {
        setQuantityErrorMessage("Quantité entre [1 .. " + maxQuantity + " ]");
        console.log(quantityErrorMessage);
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
    },
    [
      maxQuantity,
      quantityErrorMessage,
      setQuantityErrorMessage,
      updateFluxAttribute,
      updateFluxQuantity,
    ]
  );

  // const handleEditFluxRelatedQuantityInLine = (
  //   id: string,
  //   value: number,
  //   attribute?: string
  // ) => {
  //   if (attribute) {
  //     updateFluxAttribute(
  //       { value: { quantity: value }, attributeUuid: attribute },
  //       {
  //         onSuccess: () => {
  //           updateFluxRelatedQuantity([value, id], {
  //             onSuccess: () => {
  //               console.log("Flux updated");
  //             },
  //           });
  //         },
  //       }
  //     );
  //   }
  // };

  const handleEditFluxObservationInLine = useCallback(
    (id: string, value: string) => {
      updateFluxObservation([value, id], {
        onSuccess: () => {
          console.log("Flux updated");
        },
      });
    },
    [updateFluxObservation]
  );

  const columnsToPush = useMemo(() => {
    return [
      {
        Header: "Quantité reçue",
        accessor: (data: ProductOperationFlux) => data.relatedQuantity,
        width: 100,
        Cell: (data: any) => {
          return (
            <Text style={{ textAlign: "center" }} size={"sm"}>
              {data.row.values["Quantité reçue"]}
            </Text>
          );
        },
      },
      {
        Header: "Quantité retournée",
        accessor: (data: ProductOperationFlux) => data.quantity,
        width: 100,
        Cell: (data: any) =>
          reception && reception.operationStatus !== "VALIDATED" ? (
            <EditableCell
              maxValue={data.row.values["Quantité reçue"]}
              value={data.row.values["Quantité retournée"]}
              column={{
                id: data.row.values["Uuid"],
                attribute: data.row.values["AttributeUuid"],
              }}
              updateData={handleEditFluxQuantityInLine}
            />
          ) : (
            <Text style={{ textAlign: "center" }} size={"sm"}>
              {data.row.values["Quantité retournée"]}
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
          return reception && reception.operationStatus !== "VALIDATED" ? (
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
      },
    ];
  }, [
    handleEditFluxObservationInLine,
    handleEditFluxQuantityInLine,
    reception,
  ]);

  // const checkAttributeExistence = () => {
  //   if (form.values.product !== "") {
  //     setProductUuid(form.values.product);

  //     if (form.values.batchNumber !== "") {
  //       if (reception && reception.fluxes.length > 0) {
  //         if (
  //           reception.fluxes.some(
  //             (flux) =>
  //               // flux.product.uuid !== form.values.product &&
  //               (fluxUuid === "" || flux.uuid !== fluxUuid) &&
  //               Fn.extractInformation(
  //                 flux.attributes,
  //                 flux.product.uuid,
  //                 "attribute"
  //               ).batchNumber === form.values.batchNumber
  //           )
  //         ) {
  //           // console.log("Already exist");
  //           setAttributeAlreadyExist(true);
  //           setToolTipText(
  //             `Le numero de lot appartient à un produit de la liste en cours`
  //           );
  //         } else {
  //           setAttributeAlreadyExist(false);
  //           setToolTipText("");
  //           getAttribute();
  //         }
  //       }
  //     }
  //   } else {
  //     setProductUuid("");
  //   }
  // };

  // const handleSetDefaultValues = useCallback(
  //   (flux: ProductOperationFlux) => {
  //     if (!form.values.product || form.values.product === "") {
  //       form.setValues((currentValues) => ({
  //         ...currentValues,
  //         product: flux.product.uuid,
  //         quantity: flux.quantity.toString(),
  //         relatedQuantity: flux.quantity.toString(),
  //         batchNumber: Fn.extractInformation(
  //           flux.attributes,
  //           flux.product.uuid,
  //           "attribute"
  //         ).batchNumber,
  //         expiryDate: dayjs(
  //           Fn.extractInformation(
  //             flux.attributes,
  //             flux.product.uuid,
  //             "attribute"
  //           ).expiryDate
  //         ).toDate(),
  //         observation: flux.observation ? flux.observation : "",
  //         uuid: flux.uuid ? flux.uuid : "",
  //       }));
  //     }
  //   },
  //   [form]
  // );

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
      RECEPTION_EDIT_COLUMNS.push(...columnsToPush);
    }
    return RECEPTION_EDIT_COLUMNS;
  }, [columnsToPush]);

  // console.log(columns);

  const fluxes: ProductOperationFlux[] = useMemo(
    () => (reception ? reception.fluxes : []),
    [reception]
  );

  // const handleLoadFluxInfo = useCallback(() => {
  //   if (flux) {
  //     setProductUuid(flux.product.uuid);
  //     handleSetDefaultValues(flux);
  //     setAttributeUuid(
  //       Fn.extractInformation(flux.attributes, flux.product.uuid, "attribute")
  //         .uuid
  //     );
  //     // setFluxAttributeUuid(
  //     //   Fn.extractInformation(flux.attributes, flux.product.uuid, "uuid")
  //     // );
  //   }
  // }, [flux, handleSetDefaultValues]);

  useEffect(() => {
    // if (fluxUuid !== "") {
    //   findFlux();
    //   handleLoadFluxInfo();
    // }
    // if (attribute) {
    //   setAttributeAlreadyExist(true);
    //   setToolTipText(
    //     `Le numero de lot appartient aux produit : ${attribute.batchNumber} - (${attribute.product.code}) ${attribute.product.dispensationName}`
    //   );
    // }
    if (productUuid) {
      getProduct();
    }
    if (productSelected !== "") {
      const attributeFlux = parentFluxAttributes.find(
        (p) => p.attribute.batchNumber === productSelected
      );
      if (
        attributeFlux &&
        (!form.values.product || form.values.product === "")
      ) {
        setProductUuid(attributeFlux.attribute.product.uuid);
        setMaxQuantity(attributeFlux.quantity);
        setAttributeUuid(attributeFlux.attribute.uuid);
        form.setValues((currentValues) => ({
          ...currentValues,
          product: attributeFlux.attribute.product.uuid,
          relatedQuantity:
            reception && reception.quantityType === "PACKAGING"
              ? (
                  attributeFlux.quantity /
                  attributeFlux.attribute.product.conversionUnit
                ).toString()
              : attributeFlux.quantity.toString(),
          batchNumber: productSelected,
          expiryDate: dayjs(attributeFlux.attribute.expiryDate).format(
            "DD/MM/YYYY"
          ),
        }));
      }
    }
  }, [
    // fluxUuid,
    // findFlux,
    // flux,
    productUuid,
    getProduct,
    // handleLoadFluxInfo,
    productSelected,
    parentFluxAttributes,
    setMaxQuantity,
    form,
    reception,
  ]);

  // const createAttributeFromForm = (
  //   values: typeof form["values"]
  // ): ProductAttributeSave => {
  //   // console.log(
  //   //   values.expiryDate,
  //   //   dayjs(
  //   //     dayjs(values.expiryDate, "DD/MM/YYYY").format("DD/MM/YYYY")
  //   //   ).toDate()
  //   // );
  //   return {
  //     product: values.product,
  //     batchNumber: values.batchNumber,
  //     expiryDate: dayjs(values.expiryDate, "DD/MM/YYYY", "fr").toDate(),
  //     location: reception?.location.uuid,
  //   };
  // };

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

  // const handleEditFlux = useCallback((value: string) => {
  //   setFluxUuid(() => value);
  // }, []);

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
    if (form.validate() && product) {
      const conversionUnit =
        reception?.quantityType === "DISPENSATION" ? 1 : product.conversionUnit;
      const flux = createFluxFromForm(values);
      flux.attributes = [
        {
          quantity: flux.quantity * conversionUnit,
          attribute: attributeUuid,
          location: flux.location,
        },
      ];
      addFlux(flux, {
        onSuccess: () => {
          refetchReception();
          setProductSelected("");
          form.reset();
        },
      });
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
          <Group position={"apart"} spacing={"xs"}>
            <Badge color={"green"} size={"lg"}>
              RETOUR DE PRODUITS
            </Badge>

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
        {reception && reception.operationStatus === "NOT_COMPLETED" && (
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
                      <Select
                        // required
                        searchable
                        nothingFound="Aucun produit trouvé"
                        placeholder="Choix du produit"
                        maxDropdownHeight={280}
                        icon={<FontAwesomeIcon icon={faLeaf} />}
                        data={productSelectListReturn}
                        value={productSelected}
                        onChange={setProductSelected}
                      />
                      <Input
                        type={"hidden"}
                        {...form.getInputProps("product")}
                      />
                    </td>
                    <td>
                      <TextInput
                        {...form.getInputProps("batchNumber")}
                        readOnly
                      />
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
                      <Button type="submit">
                        <FontAwesomeIcon icon={faSave} />
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

export default ReceptionReturnFluxForm;
