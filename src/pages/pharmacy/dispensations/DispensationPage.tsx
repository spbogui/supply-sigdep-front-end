import {faEdit, faEye} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Button, Card, Grid, Group, Text, useMantineTheme,} from "@mantine/core";
import {useEffect, useMemo, useState} from "react";
import {ProductOperation} from "../../../models/ProductOperation";
import {useNavigate} from "react-router-dom";
import {useGetOperations} from "../../../hooks/operation";
import dayjs from "dayjs";
import ScheduledPatient from "../../../components/dispensations/ScheduledPatient";
import DispensationList from "../../../components/dispensations/DispensationList";
import DispensationHeaderForm from "../../../components/dispensations/DispensationHeaderForm";
import {DISPENSATION_LIST_COLUMNS} from "../../../components/tables/columns/dispensation";
import {useUserContext} from "../../../hooks/context";
import {useFindPatientActiveFile} from "../../../hooks/shared";
import {Fn} from "../../../utils/Fn";
import {DataSetPatientActiveFile} from "../../../models/shared";

const operationTypeUuid = "DISPENSATIONOOOOOOOOOOOOOOOOOOOOOOOOOO";

const DispensationPage = () => {
    const {userLocation} = useUserContext();
    const theme = useMantineTheme();

    const [patientActiveFile, setPatientActiveFile] = useState<DataSetPatientActiveFile[]>([]);
    const [loadPatientActiveFile, setLoadPatientActiveFile] = useState<boolean>(true);

    const {operations} = useGetOperations(
        operationTypeUuid,
        `startDate=${dayjs(new Date()).format("DD/MM/YYYY")}&v=full`
    );

    const {getPatientActiveFile} = useFindPatientActiveFile();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const params = useMemo(() => {
        return {location: userLocation ? userLocation.uuid : "", endDate: new Date(), nbLate: 28}
    }, [userLocation]);

    const columns = useMemo(() => DISPENSATION_LIST_COLUMNS, []);
    const dispensations = useMemo(() => operations, [operations]);

    const navigate = useNavigate();

    useEffect(() => {
        if (loadPatientActiveFile && userLocation) {
            getPatientActiveFile(params, {
                onSuccess: (result) => {
                    // console.log(result);
                    // const patients = Fn.transformDataSet(result);
                    setPatientActiveFile(Fn.transformDataSet(result))
                    // console.log(patients);
                    setLoadPatientActiveFile(false);
                }
            })
        }
        //     return () => {
        //         if (params.location !== "") {
        //             getPatientActiveFile(params, {
        //                 onSuccess: (result) => {
        //                     console.log(result);
        //
        //                 }
        //             })
        //         }
        //     };
    }, [getPatientActiveFile, loadPatientActiveFile, params]);

    const tableHooks = (hooks: any) => {
        hooks.visibleColumns.push((columns: any) => [
            ...columns,
            {
                id: "Menu",
                Header: "",
                accessor: (data: ProductOperation) => data.operationStatus,
                with: 10,
                maxWidth: 10,
                Cell: (data: any) => (
                    <Group>
                        <Button
                            compact
                            variant={"subtle"}
                            onClick={() =>
                                navigate(
                                    `/supply/dispensation/edit/${data.row.values[
                                        "Numéro du patient"
                                        ].replaceAll("/", "%20")}/${
                                        data.row.values["Numéro du patient"].match(
                                            /^[0-9]{4}\/.{2}\/[0-9]{2}\/[0-9]{5}E?$/g
                                        )
                                            ? "HIV"
                                            : "OTHER"
                                    }/${data.row.values.Uuid}`
                                )
                            }
                        >
                            <FontAwesomeIcon
                                icon={data.row.values["Statut"] !== "VALIDÉ" ? faEdit : faEye}
                                size={"2x"}
                            />
                        </Button>
                        {data.row.values["Statut"] !== "VALIDÉ" && (
                            <Button
                                compact
                                variant={"subtle"}
                                onClick={() =>
                                    navigate(
                                        `/supply/dispensation/view/${data.row.values[
                                            "Numéro du patient"
                                            ].replaceAll("/", "%20")}/HIV`
                                    )
                                }
                                color={"red"}
                            >
                                <FontAwesomeIcon icon={faEye} size={"2x"}/>
                            </Button>
                        )}
                    </Group>
                ),
            },
        ]);
    };

    return (
        <>
            <DispensationHeaderForm/>
            <Grid mt={"xs"}>
                <Grid.Col span={3}>
                    <ScheduledPatient patients={patientActiveFile}/>
                </Grid.Col>
                <Grid.Col span={6}>
                    <DispensationList
                        dispensations={dispensations}
                        tableHooks={tableHooks}
                        columns={columns}
                    />
                </Grid.Col>
                <Grid.Col span={3}>
                    <Card>
                        <Card.Section>
                            <Group
                                m={"xs"}
                                position="apart"
                                style={{marginBottom: 5, marginTop: theme.spacing.sm}}
                            >
                                <Text weight={500}>Informations</Text>
                            </Group>
                        </Card.Section>
                    </Card>
                </Grid.Col>
            </Grid>
        </>
    );
};

export default DispensationPage;
