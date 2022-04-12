import {Fn} from "../../utils/Fn";
import {
    ProductDispensation,
    ProductDispensationUpdate,
    ProductOperationFlux,
    ProductOperationFluxSave
} from "../../models/ProductOperation";
import {useCallback, useEffect, useMemo} from "react";
import {
    Badge,
    Box,
    Button,
    Card,
    Grid,
    Group,
    Menu,
    Radio,
    RadioGroup,
    Select,
    Text,
    TextInput,
    useMantineTheme
} from "@mantine/core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle, faEyeSlash, faLeaf, faList, faSave, faTrash} from "@fortawesome/free-solid-svg-icons";
import {useFindProduct, useGetRegimes, useProgramProducts} from "../../hooks/product";
import {useInputState} from "@mantine/hooks";
import {useFindPatient, useFindProvider} from "../../hooks/shared";
import {useFluxMutation} from "../../hooks/flux";
import {useForm} from "@mantine/form";
import {useFindDispensation, useOperationMutation} from "../../hooks/operation";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {useNavigate} from "react-router-dom";
import {useModals} from "@mantine/modals";
import {useQueryClient} from "react-query";
import {useUserContext} from "../../hooks/context";
import {OperationStatus} from "../../models/enums";
import {DISPENSATION_FLUX_EDIT_COLUMNS} from "../tables/columns/dispensation";
import {EditableCell} from "../tables/EditableCell";
import {DatePicker} from "@mantine/dates";
import CustomTable from "../tables/CustomTable";

type DispensationFormProps = {
    dispensationUuid: string;
    type: string;
    identifier: string
}

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

const DispensationFrom = (props: DispensationFormProps) => {
    const {dispensationUuid, type, identifier} = props;
    const navigate = useNavigate();
    const modals = useModals();
    const queryClient = useQueryClient();
    const theme = useMantineTheme();

    const {userLocation} = useUserContext();
    const {productRegimeSelectList} = useGetRegimes();

    const {
        updateOperationStatus,
        removeOperation,
        updateDispensation
    } = useOperationMutation(dispensationUuid);

    const {
        dispensation,
        getDispensation,
    } = useFindDispensation(dispensationUuid);

    const {patient} = useFindPatient(identifier, "&v=full");

    productRegimeSelectList.push({label: " AUCUN REGIME", value: ""});
    productRegimeSelectList.sort((a, b) => (a.label > b.label ? 1 : -1));

    const [productUuid, setProductUuid] = useInputState<string>("");
    const [calculatedTreatmentEndDate, setCalculatedTreatmentEndDate] = useInputState<string>("")

    const [quantityErrorMessage, setQuantityErrorMessage] =
        useInputState<string>("");
    const [maxQuantity, setMaxQuantity] = useInputState<number | null>(null);
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

    const handleSubmit = (values: typeof fluxForm["values"]) => {
        if (fluxForm.validate() && product) {
            const flux = createFluxFromForm(values);

            addFlux(flux, {
                onSuccess: () => {
                    getDispensation();
                    fluxForm.reset();
                },
            });
        }
    };

    const hiddenColumns = ["AttributeUuid", "Uuid"];

    const tableHooks = (hooks: any) => {
        hooks.visibleColumns.push((columns: any) => [
            ...columns,
            {
                id: "Menu",
                Header: "",
                with: 10,
                maxWidth: 10,
                Cell: (data: any) => (
                    <div style={{textAlign: "right"}}>
                        <Menu>
                            <Menu.Item
                                icon={<FontAwesomeIcon icon={faTrash}/>}
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

    const getTreatmentEndDate = () => {
        dispensationForm.setFieldValue('treatmentEndDate', undefined);
        if (dispensationForm.values.dispensationDate &&
            dispensationForm.values.treatmentDuration) {
            // if (latestDispensation) {
            //     if (dayjs(latestDispensation.treatmentEndDate).isSameOrBefore(dayjs(dispensationForm.values.dispensationDate))) {
            //         setCalculatedTreatmentEndDate(
            //             dayjs(dispensationForm.values.dispensationDate).add(dispensationForm.values.treatmentDuration, 'day').format("DD/MM/YYYY")
            //         );
            //         dispensationForm.values.treatmentEndDate = dayjs(dispensationForm.values.dispensationDate).add(dispensationForm.values.treatmentDuration, 'day').toDate();
            //     } else {
            //         setCalculatedTreatmentEndDate(
            //             dayjs(latestDispensation.treatmentEndDate).add(dispensationForm.values.treatmentDuration, 'day').format("DD/MM/YYYY")
            //         );
            //         dispensationForm.values.treatmentEndDate = dayjs(latestDispensation.treatmentEndDate).add(dispensationForm.values.treatmentDuration, 'day').toDate()
            //     }
            // } else {
            //     setCalculatedTreatmentEndDate(
            //         dayjs(dispensationForm.values.dispensationDate).add(dispensationForm.values.treatmentDuration, 'day').format("DD/MM/YYYY")
            //     );
            //     dispensationForm.values.treatmentEndDate = dayjs(dispensationForm.values.dispensationDate).add(dispensationForm.values.treatmentDuration, 'day').toDate();
            // }
        }
        console.log(dispensationForm.values)

    };


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

    const handleSubmitDispensation = (values: DispensationForm) => {

        if (dispensationForm.validate()) {
            // console.log('I am in update mode')
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

    };

    const handleSetDefaultValues = useCallback((values: ProductDispensation) => {
        dispensationForm.setValues((currentValues) => ({
            ...currentValues,
            age: values.age,
            gender: values.gender ? values.gender : "",
            treatmentDuration: values.treatmentDuration ? values.treatmentDuration : undefined,
            treatmentEndDate: dayjs(values.treatmentEndDate).toDate(),
            dispensationDate: values.operationDate ? dayjs(values.operationDate).toDate() : undefined,
            prescriptionDate: values.prescriptionDate ? dayjs(values.prescriptionDate).toDate() : undefined,
            provider: values.provider && values.provider.uuid ? values.provider.uuid : "",
            regime: values.productRegime?.uuid ? values.productRegime?.uuid : "",
            regimeLine: values.regimeLine,
            goal: values.goal ? values.goal : ""
        }));
        console.log(values.treatmentEndDate)
        setCalculatedTreatmentEndDate(values.treatmentEndDate ? dayjs(values.treatmentEndDate).format("DD/MM/YYYY").split("+")[0] : "");
    }, []);

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


    return <Box>
        {dispensation !== undefined && (<>
            <form onSubmit={dispensationForm.onSubmit((values) => handleSubmitDispensation(values))}>
                <Card
                    style={{
                        border: 1,
                        borderStyle: "solid",
                        borderColor: theme.colors.blue[1],
                    }}
                    p={"xs"} mt={"xs"}
                    radius={0}
                >
                    <Card.Section>
                        <Group
                            m={"xs"}
                            position="apart"
                            style={{marginBottom: 5, marginTop: theme.spacing.sm}}
                        >
                            <Group>
                                <FontAwesomeIcon
                                    icon={faList}
                                    size={"1x"}
                                    color={theme.colors.blue[9]}
                                />
                                <Text
                                    color={"blue"}
                                    weight={"bold"}
                                    transform={"uppercase"}
                                >
                                    Formulaire de dispensation
                                </Text>
                            </Group>

                            <Group>
                                {dispensation.operationStatus === "VALIDATED" ? (
                                    <Button
                                        size="xs"
                                        color={"green"}
                                        leftIcon={<FontAwesomeIcon icon={faEyeSlash}/>}
                                        onClick={cancelOperation}
                                    >
                                        Annuler dispensation
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            type="submit"
                                            size="xs"
                                            color={"green"}
                                            leftIcon={<FontAwesomeIcon icon={faCheckCircle}/>}
                                            // onClick={validateOperation}
                                        >
                                            Enregistrer
                                        </Button>
                                        <Button
                                            size="xs"
                                            color={"red"}
                                            leftIcon={<FontAwesomeIcon icon={faTrash}/>}
                                            onClick={removeCurrentOperation}
                                        >
                                            Supprimer
                                        </Button>
                                    </>
                                )}
                            </Group>
                        </Group>
                    </Card.Section>
                    {/*<Card.Section>*/}
                    {/*    <Divider my={"xs"} color={theme.colors.blue[1]}/>*/}
                    {/*</Card.Section>*/}
                </Card>
                <Card
                    style={{
                        backgroundColor: theme.colors.blue[1],
                        border: 1,
                        borderColor: theme.colors.blue[7],
                        borderStyle: "solid",
                    }}
                    p={"xs"}
                    radius={0}
                >
                    <Grid columns={12}>
                        {!patient && (type === "HIV" || type === "PREVENTION")
                            && dispensation && dispensation.operationStatus === "NOT_COMPLETED" &&
                            (<>
                                <Grid.Col span={1}>
                                    <TextInput
                                        label={"Age"}
                                        placeholder={"age"}
                                        {...dispensationForm.getInputProps("age")} style={{width: 55}}/>
                                </Grid.Col>
                                <Grid.Col span={2}>
                                    <RadioGroup
                                        label={"Sexe"}
                                        size={"sm"}
                                        {...dispensationForm.getInputProps("gender")}
                                    >
                                        <Radio
                                            label={"M"}
                                            value={"M"}
                                        />
                                        <Radio
                                            label={"F"}
                                            value={"F"}
                                        />
                                    </RadioGroup>
                                </Grid.Col>
                            </>)}

                        {(type === "HIV" || type === "PREVENTION") && (
                            <>
                                <Grid.Col span={3}>
                                    <Select
                                        disabled={
                                            dispensation.operationStatus !== "NOT_COMPLETED"
                                        }
                                        searchable
                                        clearable
                                        label={"Régime dipsensé"}
                                        data={productRegimeSelectList}
                                        {...dispensationForm.getInputProps("regime")}
                                        onBlur={getProductList}
                                        size={"sm"}
                                    />
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <RadioGroup
                                        label={"Ligne thérapeutique"}
                                        size={"sm"}
                                        {...dispensationForm.getInputProps("regimeLine")}
                                    >
                                        <Radio
                                            disabled={
                                                dispensation.operationStatus !== "NOT_COMPLETED"
                                            }
                                            label={"L 1"}
                                            value={"1"}
                                        />
                                        <Radio
                                            disabled={
                                                dispensation.operationStatus !== "NOT_COMPLETED"
                                            }
                                            label={"L 2"}
                                            value={"2"}
                                        />
                                        <Radio
                                            disabled={
                                                dispensation.operationStatus !== "NOT_COMPLETED"
                                            }
                                            label={"L 3"}
                                            value={"3"}
                                        />
                                    </RadioGroup>
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    {type === "HIV" ? (
                                        <RadioGroup
                                            label={"But"}
                                            size={"sm"}
                                            {...dispensationForm.getInputProps("goal")}
                                        >
                                            <Radio
                                                disabled={
                                                    dispensation.operationStatus !== "NOT_COMPLETED"
                                                }
                                                label={"PEC"}
                                                value={"PEC"}
                                            />
                                            <Radio
                                                disabled={
                                                    dispensation.operationStatus !== "NOT_COMPLETED"
                                                }
                                                label={"PTME"}
                                                value={"PTME"}
                                            />
                                            <Radio
                                                disabled={
                                                    dispensation.operationStatus !== "NOT_COMPLETED"
                                                }
                                                label={"Autre"}
                                                value={"Autre"}
                                            />
                                        </RadioGroup>
                                    ) : (
                                        <RadioGroup
                                            label={"But"}
                                            size={"sm"}
                                            {...dispensationForm.getInputProps("goal")}
                                        >
                                            <Radio
                                                disabled={
                                                    dispensation.operationStatus !== "NOT_COMPLETED"
                                                }
                                                label={"AES"}
                                                value={"AES"}
                                            />
                                            <Radio
                                                disabled={
                                                    dispensation.operationStatus !== "NOT_COMPLETED"
                                                }
                                                label={"PREP"}
                                                value={"PREP"}
                                            />
                                        </RadioGroup>
                                    )}
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <Select
                                        disabled={
                                            dispensation.operationStatus !== "NOT_COMPLETED"
                                        }
                                        label={"Prescripteur"}
                                        data={providerSelectList}
                                        {...dispensationForm.getInputProps("provider")}
                                    />
                                </Grid.Col>
                            </>
                        )}

                        <Grid.Col span={2}>
                            <DatePicker
                                disabled={
                                    dispensation.operationStatus !== "NOT_COMPLETED"
                                }
                                label={"Date de prescription"}
                                locale="fr"
                                inputFormat="DD/MM/YYYY"
                                {...dispensationForm.getInputProps("prescriptionDate")}
                                maxDate={
                                    dispensation
                                        ? dayjs(dispensation.operationDate)
                                            // .add(1, "days")
                                            .toDate()
                                        : dayjs(new Date()).toDate()
                                }
                                defaultValue={
                                    dispensation
                                        ? dayjs(dispensation.operationDate).toDate()
                                        : undefined
                                }
                                // onBlur={savePrescriptionDate}
                            />
                        </Grid.Col>

                        <Grid.Col span={2}>
                            {dispensation ? (
                                <TextInput
                                    disabled={
                                        dispensation.operationStatus !== "NOT_COMPLETED"
                                    }
                                    label={"Date de dispensation"}
                                    readOnly
                                    color={theme.colors.blue[9]}
                                    value={dayjs(dispensation.operationDate).format("DD/MM/YYYY").split("+")[0]}
                                    // mt={4}
                                />
                            ) : (
                                <DatePicker
                                    label={"Date de dispensation"}
                                    locale="fr"
                                    size="sm"
                                    inputFormat="DD/MM/YYYY"
                                    maxDate={dayjs(new Date()).toDate()}
                                    minDate={
                                        dispensationForm.values.prescriptionDate
                                            ? dayjs(dispensationForm.values.prescriptionDate).toDate()
                                            : undefined
                                    }
                                    {...dispensationForm.getInputProps("dispensationDate")}
                                    onBlur={getTreatmentEndDate}
                                />
                            )}
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <TextInput
                                disabled={
                                    dispensation.operationStatus !== "NOT_COMPLETED"
                                }
                                label={"Durée du traitement"}
                                size="sm"
                                {...dispensationForm.getInputProps("treatmentDuration")}
                                onBlur={getTreatmentEndDate}
                            />
                        </Grid.Col>
                        <Grid.Col span={2}>
                            <TextInput
                                disabled={
                                    dispensation.operationStatus !== "NOT_COMPLETED"
                                }
                                label={"Fin de traitement"}
                                readOnly
                                value={calculatedTreatmentEndDate}
                                onChange={setCalculatedTreatmentEndDate}
                            />
                        </Grid.Col>
                    </Grid>
                </Card>
            </form>
            <Card
                style={{
                    border: 1,
                    borderColor: theme.colors.blue[7],
                    borderStyle: "solid",
                    borderTop: 0
                }}
                p={"xs"}
                radius={0}>
                <form onSubmit={fluxForm.onSubmit((values) => handleSubmit(values))}>
                    <CustomTable
                        data={fluxes}
                        columns={columns}
                        initialState={{hiddenColumns}}
                        tableHooks={
                            dispensation.operationStatus !== "NOT_COMPLETED"
                                ? undefined
                                : tableHooks
                        }
                        form={
                            dispensation.operationStatus === "NOT_COMPLETED" ? (
                                <tr style={{backgroundColor: "#eee"}}>
                                    <td colSpan={3}>
                                        <Select
                                            // required
                                            searchable
                                            clearable
                                            nothingFound="Aucun produit trouvé"
                                            placeholder="Choix du produit"
                                            maxDropdownHeight={280}
                                            icon={<FontAwesomeIcon icon={faLeaf}/>}
                                            data={productSelectList}
                                            // {...form.getInputProps("product")}
                                            // onChange={(e) => console.log(e)}
                                            value={productUuid}
                                            onChange={setProductUuid}
                                            onBlur={onProductSelected}
                                        />
                                    </td>
                                    <td>
                                        <TextInput
                                            {...fluxForm.getInputProps("relatedQuantity")}
                                        />
                                    </td>
                                    <td>
                                        <TextInput
                                            {...fluxForm.getInputProps("quantity")}
                                            rightSectionWidth={70}
                                            rightSection={
                                                maxQuantity || maxQuantity === 0 ? (
                                                    <Badge
                                                        variant="filled"
                                                        radius={"xs"}
                                                        color={maxQuantity === 0 ? "red" : undefined}
                                                    >
                                                        {maxQuantity}
                                                    </Badge>
                                                ) : null
                                            }
                                            style={{width: 200}}
                                        />
                                    </td>
                                    <td style={{width: 10, textAlign: "right"}}>
                                        {!maxQuantity && maxQuantity !== 0 ? (
                                            ""
                                        ) : maxQuantity === 0 ? (
                                            <Text
                                                color={"red"}
                                                weight={"bold"}
                                                transform={"uppercase"}
                                            >
                                                Pas en stock
                                            </Text>
                                        ) : fluxForm.values.quantity !== "" ? (
                                            maxQuantity >= parseInt(fluxForm.values.quantity) ? (
                                                <Button type="submit">
                                                    <FontAwesomeIcon icon={faSave}/>
                                                </Button>
                                            ) : (
                                                <Text
                                                    color={"red"}
                                                    weight={"bold"}
                                                    transform={"uppercase"}
                                                >
                                                    Trop grand
                                                </Text>
                                            )
                                        ) : (
                                            ""
                                        )}
                                    </td>
                                </tr>
                            ) : undefined
                        }
                    />
                </form>
            </Card>
        </>)}
    </Box>
}

export default DispensationFrom;