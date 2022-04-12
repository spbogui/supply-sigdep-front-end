import {faFemale, faMale} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Avatar, Group, Text, UnstyledButton, useMantineTheme,} from "@mantine/core";
import dayjs from "dayjs";
import React from "react";
import {useNavigate} from "react-router-dom";

type PatientButtonProps = {
    identifier: string;
    age: number;
    treatmentEnDate?: Date;
    color?: string;
    gender: string;
    // onClick: () => void;
};

const PatientButton = (props: PatientButtonProps) => {
    const {identifier, age, treatmentEnDate, color, gender} = props;
    const theme = useMantineTheme();
    const navigate = useNavigate();

    return (
        <UnstyledButton
            style={{
                border: 1,
                borderStyle: "solid",
                borderColor: color ? color : theme.colors.blue[4],
                borderRadius: 5,
                backgroundColor: color ? color : theme.colors.blue[1],
                width: "100%",
            }}
            onClick={() => navigate(
                `/supply/dispensation/view/${identifier.replaceAll("/", "%20")}/HIV`)}
            p={"xs"}
            mt={"xs"}
        >
            <Group>
                <Avatar size={40} color={gender === "M" ? "blue" : color}>
                    <FontAwesomeIcon icon={gender === "M" ? faMale : faFemale} size={"2x"}/>
                </Avatar>
                <div>
                    <Group position="apart">
                        <Text size="xl" color={theme.colors.blue[9]} weight={"bold"}>
                            {identifier}
                        </Text>
                        <Text size="xl" color={theme.colors.green[9]} weight={"bold"}>
                            {age} ans
                        </Text>
                    </Group>
                    <Group>
                        <Text>Fin de traitement :</Text>
                        <Text size="xl" color={theme.colors.green[9]} weight={"bold"}>
                            {dayjs(treatmentEnDate).format("DD/MM/YYYY")}
                        </Text>
                        {/* <Badge size="xl" color={theme.colors.red[9]}>
              
            </Badge> */}
                    </Group>
                </div>
            </Group>
        </UnstyledButton>
    );
};

export default PatientButton;
