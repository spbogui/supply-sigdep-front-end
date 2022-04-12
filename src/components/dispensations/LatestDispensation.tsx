import React from 'react';
import {Card, Center, Grid, Group, Text, useMantineTheme} from "@mantine/core";
import {useFindPatient} from "../../hooks/shared";
import {useFindPatientLastDispensation} from "../../hooks/operation";
import dayjs from "dayjs";

type LatestDispensationProps = {
    identifier: string;
    dispensationUuid?: string
}
const LatestDispensation = (props: LatestDispensationProps) => {
    const {identifier, dispensationUuid} = props;
    const theme = useMantineTheme();
    const {patient} = useFindPatient(identifier);
    const {lastDispensation} = useFindPatientLastDispensation(identifier, true);

    // console.log('lastDispensation in last dispensation', lastDispensation, identifier)

    return (
        <Grid columns={16}>
            <Grid.Col span={3}>
                <Card
                    style={{
                        border: 1,
                        borderStyle: "solid",
                        borderColor: theme.colors.blue[3],
                        backgroundColor: theme.colors.blue[1],
                    }}
                    p={"xs"}
                >
                    <Group spacing={"xs"} style={{height: 30}}>
                        <Text size="sm" color={"gray"}>
                            Age :
                        </Text>
                        <Text size="md" color={"blue"} weight={"bold"}>
                            {patient ? (
                                patient.person.age + " ans"
                            ) : lastDispensation ? (
                                lastDispensation.age + " ans"
                            ) : 'N/R'}
                        </Text>
                        <Text size="sm" color={"gray"}>
                            Genre :
                        </Text>
                        <Text size="md" color={"blue"} weight={"bold"}>
                            {patient ? (
                                patient.person.gender
                            ) : lastDispensation ? (
                                lastDispensation.gender
                            ) : 'N/R'}
                        </Text>
                    </Group>
                </Card>
            </Grid.Col>
            <Grid.Col span={13}>
                <Card
                    style={{
                        border: 1,
                        borderStyle: "solid",
                        borderColor: theme.colors.green[3],
                        backgroundColor: theme.colors.green[1],
                    }}
                    p={"xs"}
                >
                    <Group>
                        {!lastDispensation ? (
                            <Center style={{height: 30}}>
                                <Text size="lg" color={theme.colors.red[6]}>
                                    Ce patient est probablement à sa première
                                    dispensation sur votre site
                                </Text>
                            </Center>
                        ) : !dispensationUuid || dispensationUuid !== lastDispensation.uuid ? (
                            <>
                                <Text
                                    size="sm"
                                    color={"gray"}
                                    transform={"uppercase"}
                                    weight={"bold"}
                                >
                                    Information dernière dispensation :
                                </Text>
                                <Text size="sm" color={"gray"}>
                                    Régime :
                                </Text>
                                <Text size="md" color={"blue"} weight={"bold"}>
                                    {lastDispensation.productRegime?.concept.display}
                                </Text>
                                <Text size="sm" color={"gray"}>
                                    Ligne :
                                </Text>
                                <Text size="sm" color={"blue"} weight={"bold"}>
                                    {lastDispensation.regimeLine}
                                </Text>
                                <Text size="sm" color={"gray"}>
                                    Date de dispensation :
                                </Text>
                                <Text size="sm" color={"blue"} weight={"bold"}>
                                    {dayjs(lastDispensation.operationDate).format(
                                        "DD/MM/YYYY"
                                    )}
                                </Text>
                                <Text size="sm" color={"gray"}>
                                    durée du traitement :
                                </Text>
                                <Text size="sm" color={"blue"} weight={"bold"}>
                                    {lastDispensation.treatmentDuration}
                                </Text>
                                <Text size="sm" color={"gray"}>
                                    Date de fin de traitement :
                                </Text>
                                <Text size="sm" color={"blue"} weight={"bold"}>
                                    {dayjs(lastDispensation.treatmentEndDate).format(
                                        "DD/MM/YYYY"
                                    )}
                                </Text>
                            </>
                        ) : (<Text>Ce patient est à sa première dispensation</Text>)}
                    </Group>
                </Card>
            </Grid.Col>
        </Grid>
    );
};

export default LatestDispensation;
