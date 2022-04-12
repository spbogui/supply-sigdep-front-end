import {faList} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Alert, Card, Center, Divider, Group, Text, useMantineTheme,} from "@mantine/core";
import {useFindPatientDispensations} from "../../hooks/operation";

type PatientDispensationListProps = {
    identifier: string;
    operationSelected?: string;
    validated: boolean;
    title: string;
};

const PatientDispensationList = (props: PatientDispensationListProps) => {
    const {identifier, operationSelected, validated, title} = props;

    const theme = useMantineTheme();

    // console.log(identifier);

    // const {operations, isLoading} = useGetOperations(
    //     OperationType.DISPENSATION,
    //     `filter=operationNumber:${identifier}${validated ? ":validated" : ""}`
    // );

    const {dispensations, encounters} = useFindPatientDispensations(identifier, validated)
    console.log('dispensations', dispensations, validated);
    console.log('encounters', encounters, validated);
    return (
        <>
            <Card
                style={{
                    border: 1,
                    borderStyle: "solid",
                    borderColor: theme.colors.blue[1],
                }}
                mt={"xs"}
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
                            <Text color={"blue"} weight={"bold"} transform={"uppercase"}>
                                {title}
                            </Text>
                        </Group>
                    </Group>
                </Card.Section>
                <Card.Section>
                    <Divider my={"xs"} color={theme.colors.blue[1]}/>
                </Card.Section>
                {validated && (
                    <>
                        {encounters.length > 0 ? (
                            <Alert>Dispensation found{encounters.length}</Alert>) : dispensations.length > 0 ?
                            <Alert>Dispensation found </Alert> : <Alert color={"red"}>
                                <Center>Aucune dispensation pour ce patient</Center>
                            </Alert>}
                    </>
                )}
                {!validated && (
                    <>
                        {dispensations.length > 0 ? <Alert>Dispensation found</Alert> : <Alert color={"red"}>
                            <Center>Aucune dispensation pour ce patient</Center>
                        </Alert>}
                    </>
                )}
                {/*{operations.length === 0 && (*/}
                {/*    <Alert color={"red"}>*/}
                {/*        <Center>Aucune dispensation pour ce patient</Center>*/}
                {/*    </Alert>*/}
                {/*)}*/}
                {/*{operations.length !== 0 && <Alert>Dispensation found</Alert>}*/}
            </Card>
        </>
    );
};

export default PatientDispensationList;
