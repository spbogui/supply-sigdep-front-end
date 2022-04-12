import {faBackward, faCapsules,} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Button, Card, Divider, Grid, Group, Text, useMantineTheme,} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useInputState} from "@mantine/hooks";
import {useModals} from "@mantine/modals";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {useCallback, useEffect, useMemo} from "react";
import {useQueryClient} from "react-query";
import {useNavigate, useParams} from "react-router-dom";
import {DISPENSATION_FLUX_EDIT_COLUMNS} from "../../../components/tables/columns/dispensation";
import {EditableCell} from "../../../components/tables/EditableCell";
import {useUserContext} from "../../../hooks/context";
import {useFluxMutation} from "../../../hooks/flux";
import {useFindDispensation, useOperationMutation,} from "../../../hooks/operation";
import {useFindProduct, useGetRegimes, useProgramProducts,} from "../../../hooks/product";
import {useFindPatient, useFindProvider} from "../../../hooks/shared";
import {Incidence, OperationStatus, QuantityType,} from "../../../models/enums";
import {
    ProductDispensation,
    ProductDispensationSave,
    ProductDispensationUpdate,
    ProductOperationFlux,
    ProductOperationFluxSave,
} from "../../../models/ProductOperation";
import {Fn} from "../../../utils/Fn";
import {OperationType} from "../../../utils/constants";
import LatestDispensation from "../../../components/dispensations/LatestDispensation";
import PatientDispensationHistory from "../../../components/dispensations/PatientDIspensationHistory";
import PatientDispensationInfo from "../../../components/dispensations/PatientDispensationInfo";
import DispensationFrom from "../../../components/dispensations/DispensationForm";

dayjs.extend(customParseFormat);

type FluxForm = {
    product: string;
    quantity: string;
    relatedQuantity: string;
    uuid?: string;
};

type DispensationForm = {
    regime: string;
    regimeLine?: number;
    treatmentDuration?: number;
    treatmentEndDate?: Date;
    prescriptionDate?: Date;
    dispensationDate?: Date | string;
    provider: string;
    goal: string;
    age?: number;
    gender: string;
}

const DispensationFormPage = () => {
    const navigate = useNavigate();
    const modals = useModals();
    const queryClient = useQueryClient();

    const {type, dispensationId, identifier} = useParams();
    const {userLocation} = useUserContext();

    // console.log("identifier", identifier?.replaceAll(" ", "/"));

    const dispensationUuid = dispensationId ? dispensationId : "";
    const theme = useMantineTheme();

    const {
        dispensation,
        getDispensation,
    } = useFindDispensation(dispensationUuid);

    // console.log(latestDispensation);

    // const {operation, getOperation} = useFindOperation(dispensationUuid);

    const patientIdentifier = identifier ? identifier.replaceAll(" ", "/") : "";

    const {patient} = useFindPatient(patientIdentifier, "&v=full");
    // console.log(patient, patient)
    const {productRegimeSelectList} = useGetRegimes();

    productRegimeSelectList.push({label: " AUCUN REGIME", value: ""});
    productRegimeSelectList.sort((a, b) => (a.label > b.label ? 1 : -1));

    // const program = dispensation ? dispensation.productProgram.uuid : "";

    // const [fluxUuid, setFluxUuid] = useState<string>("");
    const [productUuid, setProductUuid] = useInputState<string>("");
    const [calculatedTreatmentEndDate, setCalculatedTreatmentEndDate] = useInputState<string>("")

    const {
        updateOperationStatus,
        removeOperation,
        saveDispensation,
        updateDispensation
    } = useOperationMutation(dispensationUuid);

    //---> Previous dispensation info

    const [quantityErrorMessage, setQuantityErrorMessage] =
        useInputState<string>("");
    const [maxQuantity, setMaxQuantity] = useInputState<number | null>(null);

    // const {flux, findFlux} = useFindFlux(
    //     fluxUuid,
    //     dispensationUuid,
    //     "dispensation"
    // );

    const {product, getProduct} = useFindProduct(productUuid);

    const {providerSelectList} = useFindProvider();

    const {
        addFlux,
        removeFlux,
        updateFluxQuantity,
        updateFluxRelatedQuantity,
        // updateFlux,
    } = useFluxMutation(dispensationUuid);

    // const {updateOperationStatus, removeOperation} = useOperationMutation();

    const fluxForm = useForm<FluxForm>({
        initialValues: {
            product: "",
            quantity: "",
            relatedQuantity: "",
            uuid: "",
        },
        validate: (values) => ({
            product: !values.product || values.product === "" ? "Champ requis" : null,
            quantity:
                values.quantity === undefined || values.quantity.length === 0
                    ? "Champ requis"
                    : parseInt(values.quantity) === 0
                        ? "Quantité > 0"
                        : maxQuantity &&
                        parseInt(values.quantity) > maxQuantity &&
                        maxQuantity > 0
                            ? "Quantité > "
                            : null,
            relatedQuantity:
                values.relatedQuantity === undefined ||
                values.relatedQuantity.length === 0
                    ? "Champ requis"
                    : parseInt(values.relatedQuantity) === 0
                        ? "Quantité > 0"
                        : null,
        }),
    });

    const dispensationForm = useForm<DispensationForm>({
        initialValues: {
            provider: "",
            prescriptionDate: undefined,
            treatmentDuration: 0,
            treatmentEndDate: undefined,
            goal: "",
            regime: "",
            regimeLine: undefined,
            age: 1,
            gender: "",
            dispensationDate: undefined
        },
        validate: (values) => ({
            provider: (!values.provider || values.provider === "")
            && (type === "HIV" || type === "PREVENTION") ? "Champ requis" : null,
            prescriptionDate: (!values.prescriptionDate)
            && (type === "HIV" || type === "PREVENTION") ? "Champ requis" : null,
            treatmentDuration: (!values.treatmentDuration)
            && (type === "HIV" || type === "PREVENTION") ? "Champ requis" : null,
            goal: !values.goal
            && (type === "HIV" || type === "PREVENTION") ? "Champ requis" : null,
            // regime: !values.regime
            // && (type === "HIV" || type === "PREVENTION") ? "Champ requis" : null,
            regimeLine: !values.regimeLine
            && (type === "HIV" || type === "PREVENTION") ? "Champ requis" : null,
            age: !patient && !values.age
            && (type === "HIV" || type === "PREVENTION") ? "Champ requis" : null,
            gender: !patient && (!values.gender || values.gender === "")
            && (type === "HIV" || type === "PREVENTION") ? "Champ requis" : null,
            dispensationDate: !values.dispensationDate ? "Champ requis" : null
        })
    })

    const {productSelectList, getProgramProducts} = useProgramProducts(
        dispensation && dispensation.productProgram ? dispensation.productProgram.uuid : "",
        "filter=regime" + dispensationForm.values.regime
    );

    // console.log(dispensation)

    const handleEditFluxQuantityInLine = useCallback(
        (id: string, value: number) => {
            setQuantityErrorMessage("");
            if (value.toString().length === 0) {
                setQuantityErrorMessage("Quantité requise");
            } else if ((maxQuantity && value > maxQuantity) || value === 0) {
                setQuantityErrorMessage("Quantité entre [1 .. " + maxQuantity + " ]");
                // console.log(quantityErrorMessage);
            } else {
                updateFluxQuantity([value, id], {
                    onSuccess: () => {
                        console.log("Flux updated");
                    },
                });
            }
        },
        [
            maxQuantity,
            quantityErrorMessage,
            setQuantityErrorMessage,
            updateFluxQuantity,
        ]
    );

    useEffect(() => {
        // if (!dispensation) {
        //     getDispensation();
        // }

        if (productUuid !== "" && fluxForm.values.product !== productUuid) {
            fluxForm.values.product = productUuid;
            // console.log(productUuid);
            getProduct();
            // console.log("product", product);
        }
        if (dispensation && !dispensationForm.values.dispensationDate) {
            // dispensationForm.values.dispensationDate = dayjs(dispensation.operationDate).toDate();
            // dispensationForm.values.prescriptionDate = dayjs(dispensation.operationDate).toDate();
            handleSetDefaultValues(dispensation);
        }

    }, [
        dispensation,
        getDispensation,
        productUuid,
        getProduct,
        product,
    ]);

    const handleEditFluxRelatedQuantityInLine = useCallback(
        (id: string, value: number) => {
            updateFluxRelatedQuantity([value, id], {
                onSuccess: () => {
                    console.log("Flux updated");
                },
            });
        },
        [updateFluxRelatedQuantity]
    );

    const columns = useMemo(() => {
        DISPENSATION_FLUX_EDIT_COLUMNS.splice(3, 2);
        DISPENSATION_FLUX_EDIT_COLUMNS.push(
            {
                Header: "Quantité demandée",
                accessor: (data: ProductOperationFlux) => data.relatedQuantity,
                width: 100,
                Cell: (data: any) => {
                    return dispensation &&
                    dispensation.operationStatus !== "VALIDATED" ? (
                        <EditableCell
                            value={data.row.values["Quantité demandée"]}
                            column={{
                                id: data.row.values["Uuid"],
                                attribute: data.row.values["AttributeUuid"],
                            }}
                            updateData={handleEditFluxRelatedQuantityInLine}
                        />
                    ) : (
                        <Text style={{textAlign: "left"}} size={"sm"}>
                            {data.row.values["Quantité demandée"]}
                        </Text>
                    );
                },
            },
            {
                Header: "Quantité dispensée",
                accessor: (data: ProductOperationFlux) => data.quantity,
                width: 100,
                Cell: (data: any) =>
                    dispensation && dispensation.operationStatus !== "VALIDATED" ? (
                        <EditableCell
                            value={data.row.values["Quantité dispensée"]}
                            column={{
                                id: data.row.values["Uuid"],
                                attribute: data.row.values["AttributeUuid"],
                            }}
                            updateData={handleEditFluxQuantityInLine}
                            // rightSectionText={}
                        />
                    ) : (
                        <Text style={{textAlign: "center"}} size={"sm"}>
                            {data.row.values["Quantité dispensée"]}
                        </Text>
                    ),
            }
        );
        return DISPENSATION_FLUX_EDIT_COLUMNS;
    }, [
        dispensation,
        handleEditFluxQuantityInLine,
        handleEditFluxRelatedQuantityInLine,
    ]);

    const handleSubmitDispensation = (values: DispensationForm) => {
        const program = dispensation
            ? dispensation.productProgram.uuid
            : patient ||
            patientIdentifier.match(/^[0-9]{4}\/.{2}\/[0-9]{2}\/[0-9]{5}E?$/g)
                ? "PNLSARVIOPPPPPPPPPPPPPPPPPPPPPPPPPPPPP"
                : "";

        const location = userLocation.uuid;

        console.log('values', values);

        if (dispensationUuid === "") {
            const productOperation: ProductDispensationSave = {
                operationDate: dayjs(new Date()).toDate(),
                operationNumber: patientIdentifier,
                productProgram: program,
                quantityType: QuantityType.DISPENSATION,
                operationStatus: OperationStatus.VALIDATED,
                incidence: Incidence.NEGATIVE,
                operationType: OperationType.DISPENSATION,
                location,
            };
            saveDispensation(productOperation, {
                onSuccess: (operation) => {
                    if (type === "HIV" || patient) {
                        navigate(
                            `/supply/dispensation/view/${patientIdentifier.replaceAll(
                                "/",
                                "%20"
                            )}/${operation.uuid}/VIH`
                        );
                    } else {
                        navigate(`/supply/dispensation`);
                    }
                },
            });
        } else {
            if (dispensationForm.validate()) {
                console.log('I am in update mode')
                const {
                    treatmentEndDate,
                    treatmentDuration,
                    age,
                    gender,
                    goal,
                    regime,
                    provider,
                    regimeLine,
                    prescriptionDate
                } = values;
                const updatedDispensation: ProductDispensationUpdate = {
                    age,
                    gender,
                    treatmentDuration,
                    treatmentEndDate,
                    productRegime: regime,
                    regimeLine,
                    goal,
                    provider,
                    prescriptionDate,
                    operationStatus: OperationStatus.VALIDATED
                }
                updateDispensation(updatedDispensation, {
                    onSuccess: () => {
                        navigate("/supply/dispensation")
                    }
                });
            }
        }
    };

    const handleSetDefaultValues = useCallback((values: ProductDispensation) => {
        dispensationForm.setValues((currentValues) => ({
            ...currentValues,
            age: values.age,
            gender: values.gender ? values.gender : "",
            treatmentDuration: values.treatmentDuration,
            treatmentEndDate: dayjs(values.treatmentEndDate).toDate(),
            dispensationDate: dayjs(values.operationDate).toDate(),
            prescriptionDate: dayjs(values.prescriptionDate).toDate(),
            provider: values.provider && values.provider.uuid ? values.provider.uuid : "",
            regime: values.productRegime?.uuid ? values.productRegime?.uuid : "",
            regimeLine: values.regimeLine,
            goal: values.goal ? values.goal : ""
        }));
        console.log(values.treatmentEndDate)
        setCalculatedTreatmentEndDate(dayjs(values.treatmentEndDate).format("DD/MM/YYYY").split("+")[0])
    }, []);

    const cancelOperation = () => {
        updateOperationStatus(
            {status: "CANCELED", uuid: dispensationUuid},
            {
                onSuccess: () => {
                    navigate(`/supply/dispensation`);
                },
            }
        );
    };
    const removeCurrentOperation = () => {
        removeOperation(dispensationUuid, {
            onSuccess: () => {
                queryClient.invalidateQueries("dispensation");
                // navigate("/supply/dispensation");
            },
        });
    };

    // const getTreatmentEndDate = () => {
    //     dispensationForm.setFieldValue('treatmentEndDate', undefined);
    //     if (dispensationForm.values.dispensationDate &&
    //         dispensationForm.values.treatmentDuration) {
    //         if (latestDispensation) {
    //             if (dayjs(latestDispensation.treatmentEndDate).isSameOrBefore(dayjs(dispensationForm.values.dispensationDate))) {
    //                 setCalculatedTreatmentEndDate(
    //                     dayjs(dispensationForm.values.dispensationDate).add(dispensationForm.values.treatmentDuration, 'day').format("DD/MM/YYYY")
    //                 );
    //                 dispensationForm.values.treatmentEndDate = dayjs(dispensationForm.values.dispensationDate).add(dispensationForm.values.treatmentDuration, 'day').toDate();
    //             } else {
    //                 setCalculatedTreatmentEndDate(
    //                     dayjs(latestDispensation.treatmentEndDate).add(dispensationForm.values.treatmentDuration, 'day').format("DD/MM/YYYY")
    //                 );
    //                 dispensationForm.values.treatmentEndDate = dayjs(latestDispensation.treatmentEndDate).add(dispensationForm.values.treatmentDuration, 'day').toDate()
    //             }
    //         } else {
    //             setCalculatedTreatmentEndDate(
    //                 dayjs(dispensationForm.values.dispensationDate).add(dispensationForm.values.treatmentDuration, 'day').format("DD/MM/YYYY")
    //             );
    //             dispensationForm.values.treatmentEndDate = dayjs(dispensationForm.values.dispensationDate).add(dispensationForm.values.treatmentDuration, 'day').toDate();
    //         }
    //     }
    //     console.log(dispensationForm.values)
    //
    // };

    const onProductSelected = () => {
        if (productUuid !== "") {
            getProduct();
            if (product) {
                const stocks = product.stock;
                const program = dispensation ? dispensation.productProgram.name : "";

                setMaxQuantity(Fn.getProductStock(stocks, program));
            }
        } else {
            setMaxQuantity(null);
        }
        // console.log(product, maxQuantity);
    };

    const getProductList = () => {
        getProgramProducts();
        console.log(productSelectList);
    };

    const fluxes: ProductOperationFlux[] = useMemo(
        () => (dispensation ? dispensation.fluxes : []),
        [dispensation]
    );

    const handleDeleteFlux = (value: string) => {
        removeFlux(value, {
            onSuccess: () => {
                getDispensation();
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
            labels: {confirm: "Supprimer", cancel: "Annuler"},
            onCancel: () => console.log("Cancel"),
            onConfirm: () => handleDeleteFlux(value),
        });

    const createFluxFromForm = (
        values: typeof fluxForm["values"]
    ): ProductOperationFluxSave => {
        return {
            product: values.product,
            quantity: parseInt(values.quantity),
            relatedQuantity: parseInt(values.relatedQuantity),
            relatedQuantityLabel: "Quantité demandée dispensation",
            location: userLocation.uuid,
        };
    };

    // console.log(dispensationDate, dispensationTreatmentDays);
    // console.log('latestDispensation', latestDispensation)

    return (
        <>
            {/* {(type === "HIV" || patient !== undefined || type === "PREVENTION") && ( */}
            <Card
                style={{
                    border: 1,
                    borderStyle: "solid",
                    borderColor: theme.colors.blue[1],
                }}
                px={"xs"}
                pt={0}
                pb={"xs"}
            >
                <Group position="apart">
                    <Group
                        // m={"md"}
                        position="left"
                        style={{marginBottom: 5, marginTop: theme.spacing.sm}}
                    >
                        <FontAwesomeIcon
                            icon={faCapsules}
                            size={"2x"}
                            color={theme.colors.blue[7]}
                        />
                        <Text
                            size="xl"
                            weight={500}
                            transform={"uppercase"}
                            color={theme.colors.blue[7]}
                        >
                            Saisie dispensation
                        </Text>
                        {patientIdentifier ? (
                            <>
                                <Text size="xl" weight={"bold"} color={"green"}>
                                    PATIENT : {patientIdentifier}
                                </Text>
                                {(type === "HIV" || type === "PREVENTION") && (
                                    <Text
                                        size="xl"
                                        weight={"bold"}
                                        color={patient ? "green" : "orange"}
                                    >
                                        {patient ? "" : "MOBILE"}
                                    </Text>
                                )}
                            </>
                        ) : (
                            ""
                        )}
                    </Group>
                    <Button
                        leftIcon={<FontAwesomeIcon icon={faBackward}/>}
                        onClick={() => navigate("/supply/dispensation")}
                    >
                        Retour
                    </Button>
                </Group>
                <Card.Section>
                    <Divider my={"xs"}/>
                </Card.Section>
                {patientIdentifier !== "" &&
                    patientIdentifier.match(/^[0-9]{4}\/.{2}\/[0-9]{2}\/[0-9]{5}E?$/g) &&
                    <LatestDispensation identifier={patientIdentifier} dispensationUuid={dispensationUuid}/>}
            </Card>

            <Grid columns={10}>
                {type === "HIV" && patientIdentifier !== "" && (
                    <Grid.Col span={4}>
                        <PatientDispensationHistory
                            dispensationUuid={dispensationUuid}
                            identifier={patientIdentifier}/>
                    </Grid.Col>
                )}

                <Grid.Col span={type === "HIV" ? 6 : 10}>

                    {dispensationUuid === "" && <PatientDispensationInfo identifier={patientIdentifier}/>}

                    {dispensationUuid !== "" && (
                        <DispensationFrom
                            dispensationUuid={dispensationUuid}
                            type={type ? type : ""}
                            identifier={patientIdentifier}/>
                    )}
                </Grid.Col>
            </Grid>
        </>
    );
};

export default DispensationFormPage;
