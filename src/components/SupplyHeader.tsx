import React, {useState} from "react";
import {
  faBoxes,
  faCapsules,
  faCogs,
  faExchangeAlt,
  faHome,
  faPrescriptionBottle,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Badge, Box, Center, Divider, Group, SegmentedControl, Text, useMantineTheme,} from "@mantine/core";
import {useNavigate} from "react-router-dom";

const dataLink = [
    {
        label: (
            <Center>
                <Group position={"center"} direction={"column"} spacing={0}>
                    <FontAwesomeIcon icon={faHome} size={"2x"}/>
                    <Text size="xs">Accueil</Text>
                </Group>
            </Center>
        ),
        value: "Accueil",
    },
    {
        label: (
            <Center>
                <Group position={"center"} direction={"column"} spacing={0}>
                    <FontAwesomeIcon icon={faCapsules} size={"2x"}/>
                    <Text size="xs">Dispensation</Text>
                </Group>
            </Center>
        ),
        value: "Dispensation",
    },
    // {
    //   label: (
    //     <Center>
    //       <Group position={"center"} direction={"column"} spacing={0}>
    //         <FontAwesomeIcon icon={faBriefcaseMedical} size={"2x"} />
    //         <Text size="xs">Distribution</Text>
    //       </Group>
    //     </Center>
    //   ),
    //   value: "Distribution",
    // },
    {
        label: (
            <Center>
                <Group position={"center"} direction={"column"} spacing={0}>
                    <FontAwesomeIcon icon={faBoxes} size={"2x"}/>
                    <Text size="xs">Réception</Text>
                </Group>
            </Center>
        ),
        value: "Réception",
    },
    {
        label: (
            <Center>
                <Group position={"center"} direction={"column"} spacing={0}>
                    <FontAwesomeIcon icon={faExchangeAlt} size={"2x"}/>
                    <Text size="xs">Transfert</Text>
                </Group>
            </Center>
        ),
        value: "Transfert",
    },
    // {
    //   label: (
    //     <Center>
    //       <Group position={"center"} direction={"column"} spacing={0}>
    //         <FontAwesomeIcon icon={faBalanceScale} size={"2x"} />
    //         <Text size="xs">Pertes et Ajustement</Text>
    //       </Group>
    //     </Center>
    //   ),
    //   value: "Perte et Ajustement",
    // },
    {
        label: (
            <Center>
                <Group position={"center"} direction={"column"} spacing={0}>
                    <FontAwesomeIcon icon={faWarehouse} size={"2x"}/>
                    <Text size="xs">Inventaire</Text>
                </Group>
            </Center>
        ),
        value: "Inventaire",
    },
    // {
    //   label: (
    //     <Center>
    //       <Group position={"center"} direction={"column"} spacing={0}>
    //         <FontAwesomeIcon icon={faFileAlt} size={"2x"} />
    //         <Text size="xs">Rapports</Text>
    //       </Group>
    //     </Center>
    //   ),
    //   value: "Rapport d'activités",
    // },
    // {
    //   label: (
    //     <Center>
    //       <Group position={"center"} direction={"column"} spacing={0}>
    //         <FontAwesomeIcon icon={faSignal} size={"2x"} />
    //         <Text size="xs">Etat du Stock</Text>
    //       </Group>
    //     </Center>
    //   ),
    //   value: "Etat des Sotcks",
    // },
    {
        label: (
            <Center>
                <Group position={"center"} direction={"column"} spacing={0}>
                    <FontAwesomeIcon icon={faCogs} size={"2x"}/>
                    <Text size="xs">Paramètres</Text>
                </Group>
            </Center>
            // <Center>
            //   <FontAwesomeIcon icon={faCogs} size={"2x"} />
            //   {/* <div style={{ marginLeft: 10 }}></div> */}
            // </Center>
        ),
        value: "Paramètres",
    },
];

const pageLink = window.location.href;
const result = pageLink.endsWith("/supply")
    ? "Accueil"
    : pageLink.endsWith("/supply/inventory")
        ? "Inventaire"
        : pageLink.includes("/supply/inventory/")
            ? "Saisie Inventaire"
            : pageLink.endsWith("/supply/reception")
                ? "Réception"
                : pageLink.includes("/supply/reception/")
                    ? "Saisie Réception"
                    : pageLink.endsWith("/supply/transfer")
                        ? "Transfert"
                        : pageLink.includes("/supply/transfer/")
                            ? "Saisie Transfert"
                            : pageLink.endsWith("/supply/dispensation")
                                ? "Dispensation"
                                : pageLink.includes("/supply/dispensation/")
                                    ? "Dispensation"
                                    : pageLink.includes("/supply/parameter")
                                        ? "Paramètres"
                                        : "";

const SupplyHeader = () => {
    const theme = useMantineTheme();
    const [value, setValue] = useState(result);
    const navigate = useNavigate();

    const handleChange = (v: string) => {
        setValue(v);
        if (v === "Accueil") {
            navigate("/supply");
        } else if (v === "Inventaire") {
            navigate("/supply/inventory");
        } else if (v === "Réception") {
            navigate("/supply/reception");
        } else if (v === "Transfert") {
            navigate("/supply/transfer");
        } else if (v === "Dispensation") {
            navigate("/supply/dispensation");
        } else if (v === "Paramètres") {
            navigate("/supply/parameter");
        }
    };

    return (
        <div>
            <Box
                sx={(theme) => ({
                    backgroundColor:
                        theme.colorScheme === "dark"
                            ? theme.colors.dark[0]
                            : theme.colors.gray[0],
                    textAlign: "left",
                    // padding: theme.spacing.xs,
                    borderRadius: theme.radius.xs,
                    // cursor: "pointer",

                    // "&:hover": {
                    //   backgroundColor:
                    //     theme.colorScheme === "dark"
                    //       ? theme.colors.dark[5]
                    //       : theme.colors.gray[1],
                    // },
                })}
            >
                <Group position={"apart"}>
                    <Badge
                        size={"xl"}
                        sx={(theme) => ({
                            color:
                                theme.colorScheme === "dark"
                                    ? theme.colors.blue[9]
                                    : theme.colors.blue[9],
                        })}
                        leftSection={
                            <FontAwesomeIcon
                                icon={faPrescriptionBottle}
                                color={theme.colors.blue[9]}
                            />
                        }
                    >
                        Pharmacie
                    </Badge>

                    <Text
                        size={"xl"}
                        color={theme.colors.cyan[9]}
                        transform="uppercase"
                        weight={"bold"}
                    >
                        {value}
                    </Text>

                    <SegmentedControl
                        color={"blue"}
                        value={value}
                        onChange={handleChange}
                        data={dataLink}
                    />
                </Group>
            </Box>
            <Divider mb={0} color={theme.colors.blue[9]}/>
        </div>
    );
};

export default SupplyHeader;
