import {faCalendar} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Alert, Badge, Button, Card, Group, Radio, RadioGroup, Select, TextInput, useMantineTheme,} from "@mantine/core";
import {DatePicker} from "@mantine/dates";
import {useForm} from "@mantine/form";
import {useInputState} from "@mantine/hooks";
import dayjs from "dayjs";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useUserContext} from "../../hooks/context";
import {useFindFilteredOperation, useOperationMutation,} from "../../hooks/operation";
import {useLocationPrograms} from "../../hooks/product";
import {useFindPatient} from "../../hooks/shared";
import {Incidence, OperationStatus, QuantityType} from "../../models/enums";
import {ProductOperationSave} from "../../models/ProductOperation";
import {OperationType} from "../../utils/constants";

type DispensationInfoForm = {
    program: string;
    operationDate: Date | string;
    dispensationType: string;
    dispensationHivType: string;
    identifier: string;
};

const DispensationHeaderForm = () => {
    const {
        userLocation,
        // isSystemDeveloper,
        // hasPrivileges,
        // relatedLocation,
    } = useUserContext();
    const {programSelectList} = useLocationPrograms();
    const [isHivPatient, setIsHivPatient] = useState<boolean>(false);
    const [isPatient, setIsPatient] = useState<boolean>(false);
    const theme = useMantineTheme();
    const [selectedProgram, setSelectedProgram] = useInputState<string | null>(
        null
    );
    const [patientIdentifier, setPatientIdentifier] = useState<string | null>(
        null
    );
    const navigate = useNavigate();

    const {patient, findPatient, isLoading} = useFindPatient(
        patientIdentifier || ""
    );

    const {operation: latestInventory, getOperation: getLatestInventory} =
        useFindFilteredOperation(
            OperationType.INVENTORY,
            "last:validated",
            selectedProgram ? selectedProgram : "",
            "",
            true
        );

    // console.log(latestInventory, selectedProgram);
    const {operation: latestDispensation, getOperation: getLatestDispensation} =
        useFindFilteredOperation(
            OperationType.DISPENSATION,
            "last:validated",
            selectedProgram ? selectedProgram : "",
            "",
            true
        );

    const {saveDispensation} = useOperationMutation();

    const form = useForm<DispensationInfoForm>({
        initialValues: {
            program: "",
            operationDate: "",
            dispensationType: "",
            dispensationHivType: "",
            identifier: "",
        },
        validate: (values) => ({
            program: values.program === "" ? "Selectionner le programme" : null,
            operationDate: values.program === "" ? "Date requise" : null,
            dispensationType:
                values.dispensationType === "" && !values.program.includes("PNLSARVIO")
                    ? "Choisir une option"
                    : null,
            dispensationHivType:
                values.dispensationHivType === "" &&
                values.program.includes("PNLSARVIO")
                    ? "Choisir une option"
                    : null,
            identifier:
                values.dispensationHivType.includes("HIV") && values.identifier === ""
                    ? "Numéro requis"
                    : values.dispensationHivType === "HIV" &&
                    !values.identifier.match(/^[0-9]{4}\/.{2}\/[0-9]{2}\/[0-9]{5}E?$/g)
                        ? "format incorrect"
                        : values.dispensationHivType === "HIV" && values.identifier === ""
                            ? "Identifiant requis"
                            : null,
        }),
    });

    useEffect(() => {
        if (selectedProgram) {
            //   if (form.values.program !== "") form.reset();
            if (form.values.program !== selectedProgram) {
                form.values.program = selectedProgram;
                if (selectedProgram.includes("ARVIO")) setIsHivPatient(true);
                else setIsHivPatient(false);
                getLatestDispensation();
                getLatestInventory();
            }
        } else {
            if (form.values.program !== "") form.reset();
        }
        if (form.values.dispensationType === "OTHER_PATIENT") {
            setIsPatient(true);
        } else {
            setIsPatient(false);
        }
        if (patientIdentifier && patientIdentifier !== "") {
            if (form.values.identifier !== patientIdentifier) {
                findPatient();
                // console.log(patient);
            }
        }
    }, [
        selectedProgram,
        form,
        patientIdentifier,
        findPatient,
        patient,
        getLatestDispensation,
        getLatestInventory,
    ]);

    const getPatient = () => {
        if (patientIdentifier && patientIdentifier !== "") {
            findPatient().then((data) => console.log(data));
        }
    };

    const handleSubmit = (values: DispensationInfoForm): void => {
        if (form.validate()) {
            console.log(values);

            const location = userLocation.uuid;
            const productOperation: ProductOperationSave = {
                operationDate: dayjs(values.operationDate).toDate(),
                operationNumber: values.identifier,
                productProgram: selectedProgram ? selectedProgram : "",
                quantityType: QuantityType.DISPENSATION,
                operationStatus: OperationStatus.NOT_COMPLETED,
                incidence: Incidence.NEGATIVE,
                operationType: OperationType.DISPENSATION,
                location,
            };

            // console.log("productOperation", productOperation);

            saveDispensation(productOperation, {
                onSuccess: (operation) => {
                    const type =
                        form.values.dispensationHivType !== ""
                            ? form.values.dispensationHivType
                            : form.values.dispensationType;

                    navigate(
                        `/supply/dispensation/edit/${patientIdentifier?.replaceAll("/", "%20")}/${operation.uuid}/${type}`
                    );
                },
            });
        }
    };

    const searchPatient = (value: any) => {
        setPatientIdentifier(value.target.value);
    };
    return (
        <Card>
            <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
                <Group position="apart">
                    <Group>
                        <Select
                            searchable={true}
                            clearable={true}
                            value={selectedProgram}
                            onChange={setSelectedProgram}
                            style={{paddingLeft: 5, paddingRight: 5}}
                            placeholder="Selectionner le programme"
                            data={programSelectList}
                            //   {...form.getInputProps("program")}
                        />
                        {selectedProgram && (
                            <>
                                <DatePicker
                                    placeholder="Date de la dispensation"
                                    inputFormat="DD/MM/YYYY"
                                    locale="fr"
                                    //   label="Date de réception"
                                    required
                                    {...form.getInputProps("operationDate")}
                                    maxDate={dayjs(new Date()).toDate()}
                                    minDate={
                                        latestDispensation
                                            ? dayjs(latestDispensation?.operationDate).toDate()
                                            : latestInventory
                                                ? dayjs(latestInventory.operationDate).add(1, "day").toDate()
                                                : dayjs(new Date()).add(-3, "year").toDate()
                                    }
                                    icon={<FontAwesomeIcon icon={faCalendar}/>}
                                />
                                {isHivPatient && (
                                    <>
                                        <RadioGroup {...form.getInputProps("dispensationHivType")}>
                                            <Radio value={"HIV"} label={"Prise en charge VIH"}/>
                                            <Radio value={"PREVENTION"} label={"Prévention VIH"}/>
                                        </RadioGroup>
                                        {form.values.dispensationHivType && (
                                            <TextInput
                                                {...form.getInputProps("identifier")}
                                                placeholder={
                                                    form.values.dispensationHivType === "HIV"
                                                        ? "Numero de prise en charge"
                                                        : "Numéro de prévention"
                                                }
                                                style={{width: 230}}
                                                onBlur={searchPatient}
                                            />
                                        )}
                                    </>
                                )}
                                {!isHivPatient && (
                                    <>
                                        <RadioGroup {...form.getInputProps("dispensationType")}>
                                            <Radio value={"OTHER_PATIENT"} label={"Patient"}/>
                                            <Radio
                                                value={"OTHER_DISPENSATION"}
                                                label={"Autre dispensation"}
                                            />
                                        </RadioGroup>
                                        {isPatient && (
                                            <TextInput
                                                {...form.getInputProps("identifier")}
                                                placeholder="Numero du dispensation"
                                                style={{width: 230}}
                                                onBlur={getPatient}
                                            />
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </Group>
                    {patientIdentifier ? (
                        patientIdentifier.match(
                            /^[0-9]{4}\/.{2}\/[0-9]{2}\/[0-9]{5}E?$/g
                        ) ? (
                            patient ? (
                                <Alert color={theme.colors.green[9]}>
                                    Patient trouvé sur le site
                                </Alert>
                            ) : (
                                <Badge color={"red"} variant={"filled"} size={"lg"}>
                                    Patient mobile
                                </Badge>
                            )
                        ) : (
                            <Badge color={"red"} variant={"filled"} size={"lg"}>
                                Numéro patient incorrect
                            </Badge>
                        )
                    ) : null}
                    <Button
                        loading={isLoading}
                        type="submit"
                        disabled={!selectedProgram || selectedProgram === "" || isLoading}
                    >
                        Dispenser
                    </Button>
                </Group>
            </form>
        </Card>
    );
};

export default DispensationHeaderForm;
