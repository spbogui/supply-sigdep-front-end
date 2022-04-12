import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Card, Divider, ScrollArea, TextInput, useMantineTheme,} from "@mantine/core";
import React, {useEffect, useState} from "react";
import PatientButton from "./PatientButton";
import {DataSetPatientActiveFile} from "../../models/shared";
import dayjs from "dayjs";
import {useInputState} from "@mantine/hooks";

type ScheduledPatientProps = {
    patients: DataSetPatientActiveFile[];
}
const ScheduledPatient = (props: ScheduledPatientProps) => {
    const {patients} = props;

    const [identifier, setIdentifier] = useInputState<string>("");
    const [visiblePatients, setVisiblePatients] = useState<DataSetPatientActiveFile[]>([]);

    const theme = useMantineTheme();

    const filterPatient = () => {

    }

    useEffect(() => {
        setVisiblePatients([])
        if (identifier && identifier.length > 8) {
            // const list = patients.filter(p => p.identifier.includes(identifier));
            setVisiblePatients(patients.filter(p => p.identifier.includes(identifier)))
        } else {
            setVisiblePatients(patients.filter(p => dayjs(p.treatmentEndDate).add(10, 'day').isBefore(new Date())));
        }

    }, [identifier, patients]);


    return (
        <Card>
            <Card.Section>
                {/*<Group*/}
                {/*    m={"xs"}*/}
                {/*    // position="apart"*/}
                {/*    style={{marginBottom: 5, marginTop: theme.spacing.sm}}*/}
                {/*>*/}
                {/*</Group>*/}
                <TextInput
                    rightSection={<FontAwesomeIcon
                        icon={faSearch}
                        // size={"2x"}
                        color={theme.colors.blue[9]}
                    />}
                    placeholder="Filtrer par numéro"
                    // style={{width: 230}}
                    value={identifier}
                    px={"xs"}
                    mt={"xs"}
                    onChange={setIdentifier}/>
            </Card.Section>
            <Card.Section>
                <Divider mt={"xs"}/>
            </Card.Section>
            <ScrollArea style={{height: "60vh"}}>
                {visiblePatients.map(p =>
                    <PatientButton key={p.identifier}
                                   identifier={p.identifier}
                                   age={p.age}
                                   treatmentEnDate={p.treatmentEndDate}
                                   gender={p.gender}
                                   color={p.gender === "F" ? "pink" : undefined}
                    />)}
                {/* <PatientButton
          identifier="1234/01/22/76879"
          age={30}
          treatmentEnDate={new Date()}
        />
        <PatientButton
          identifier="1234/01/22/76879"
          age={30}
          treatmentEnDate={new Date()}
          // onClick={() => console.log("Button clicked")}
          color={theme.colors.red[1]}
        /> */}
            </ScrollArea>
        </Card>
    );
};

export default ScheduledPatient;
