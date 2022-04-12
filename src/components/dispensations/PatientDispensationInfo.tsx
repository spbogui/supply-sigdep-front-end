import React, {useState} from 'react';
import {Badge, Button, Card, Divider, Group, Text, useMantineTheme} from "@mantine/core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfo, faPlusCircle, faSave} from "@fortawesome/free-solid-svg-icons";
import {DatePicker} from "@mantine/dates";
import {useFindPatient, useFindPatientInfo} from "../../hooks/shared";
import dayjs from "dayjs";
import RegimeHistory from "./RegimeHistory";
import {useFindPatientLastDispensation} from "../../hooks/operation";

type PatientDispensationInfoProps = {
    identifier: string;
}

const PatientDispensationInfo = (props: PatientDispensationInfoProps) => {
    const {identifier} = props;
    const theme = useMantineTheme();

    const {patient} = useFindPatient(identifier);

    const {
        regimes,
        initialTreatmentInfo,
        transferInfo,
        treatmentEndDateInfo,
        patientInitiationEncounter
    } = useFindPatientInfo(patient ? patient.uuid : "");

    const {lastDispensation, latestDispensationEncounter} = useFindPatientLastDispensation(identifier, true);

    const [dispensationDate, setDispensationDate] = useState<Date | null>();
    return (
        <Card
            style={{
                border: 1,
                borderStyle: "solid",
                borderColor: theme.colors.blue[1],
            }}
            mt={"xs"}>
            <Card.Section>
                <Group
                    m={"xs"}
                    position="apart"
                    style={{marginBottom: 5, marginTop: theme.spacing.sm}}
                >
                    <Group>
                        <FontAwesomeIcon
                            icon={faInfo}
                            size={"1x"}
                            color={theme.colors.blue[9]}
                        />
                        <Text color={"blue"} weight={"bold"} transform={"uppercase"}>
                            INFORMATION DE DISPENSATIONS
                        </Text>
                    </Group>
                </Group>
            </Card.Section>
            <Card.Section>
                <Divider my={"xs"} color={theme.colors.blue[1]}/>
            </Card.Section>

            <Group position={"apart"}>
                <Group>
                    <FontAwesomeIcon icon={faPlusCircle} size={"2x"} color={theme.colors.blue[9]}/>
                    <Text color={"gray"}>Saisir la date de la nouvelle dispensation</Text>
                    <DatePicker
                        clearable={true}
                        maxDate={new Date()}
                        placeholder={"Date de dispensation"}
                        value={dispensationDate}
                        onChange={setDispensationDate}/>
                </Group>

                <Button leftIcon={<FontAwesomeIcon icon={faSave}/>} color={"green"}>Dispenser</Button>

            </Group>

            <Card.Section>
                <Divider my={"xs"} color={theme.colors.blue[1]}/>
            </Card.Section>

            <Group>

                <Text color={"gray"}>Date Admission :</Text>
                <Badge
                    size={"xl"}>{patientInitiationEncounter ? dayjs(patientInitiationEncounter.encounterDatetime).format("DD/MM/YYYY") : "Aucune date"}</Badge>

                <Text color={"gray"}>Date initiation ARV :</Text>
                <Badge
                    size={"xl"}>{initialTreatmentInfo ? dayjs(initialTreatmentInfo.value).format("DD/MM/YYYY") : "Aucune date"}</Badge>
                <Text color={"gray"}>Date fin de Traitement :</Text>
                <Badge
                    size={"xl"}>{treatmentEndDateInfo ? dayjs(treatmentEndDateInfo.value).format("DD/MM/YYYY") : "Aucune date"}</Badge>
            </Group>


            <Card.Section>
                <Divider my={"xs"} color={theme.colors.blue[1]}/>
            </Card.Section>

            <RegimeHistory obs={regimes}/>
        </Card>
    );
};

export default PatientDispensationInfo;
