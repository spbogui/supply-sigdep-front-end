import { faHospital } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Card,
  Group,
  Divider,
  useMantineTheme,
  Text,
  Grid,
  Select,
  Switch,
  Space,
  MultiSelect,
  Alert,
  Center,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import { useEffect, useState } from "react";
import ChildLocationPad from "../../../components/ChildLocationPad";
import {
  useFindLocation,
  useFindLocations,
  useLocationAttributeMutation,
} from "../../../hooks/location";
import { useFindPrograms } from "../../../hooks/product";
import { Location } from "../../../models/shared";
import { LocationAttributeType } from "../../../utils/constants";

const LocationConfigurationPage = () => {
  const theme = useMantineTheme();
  const [selectedLocation, setSelectedLocation] = useInputState<string>("");
  const [selectedPrograms, setSelectedPrograms] = useInputState<string[]>([]);
  const [checkedDirectClient, setCheckedDirectClient] =
    useInputState<boolean>(false);

  const [attributeUuid, setAttributeUuid] = useState<string>("");

  const { locationSelectList } = useFindLocations();
  const {
    location,
    getLocation,
    directClientAttribute,
    programAttribute,
    code,
  } = useFindLocation(selectedLocation, false, "v=full");

  const { saveLocationAttribute } = useLocationAttributeMutation(
    selectedLocation,
    attributeUuid
  );

  const saveLocationPrograms = () => {
    if (programAttribute) {
      setAttributeUuid("/" + programAttribute.uuid);
    }
    saveLocationAttribute(
      {
        attributeType: LocationAttributeType.LOCATION_PROGRAMS,
        value: selectedPrograms.join(","),
      },
      {
        onSuccess: () => {
          getLocation();
        },
      }
    );
  };

  const saveLocationIsDirectClient = () => {
    if (directClientAttribute) {
      setAttributeUuid("/" + directClientAttribute.uuid);
    }
    saveLocationAttribute(
      {
        attributeType: LocationAttributeType.DIRECT_CLIENT,
        value: checkedDirectClient,
      },
      {
        onSuccess: () => {
          getLocation();
        },
      }
    );
  };

  const { programSelectListName } = useFindPrograms();

  useEffect(() => {
    if (
      selectedLocation &&
      selectedLocation !== "" &&
      (!location || selectedLocation !== location.uuid)
    ) {
      getLocation();
    }
    if (
      directClientAttribute &&
      directClientAttribute.value !== checkedDirectClient
    ) {
      setCheckedDirectClient(directClientAttribute.value);
    }
    if (
      programAttribute &&
      programAttribute.value.split(",") !== selectedPrograms
    ) {
      setSelectedPrograms(programAttribute.value.split(","));
    }
  }, [
    selectedLocation,
    location,
    getLocation,
    directClientAttribute,
    programAttribute,
  ]);

  return (
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
          style={{ marginBottom: 5, marginTop: theme.spacing.sm }}
        >
          <Group>
            <FontAwesomeIcon
              icon={faHospital}
              size={"2x"}
              color={theme.colors.blue[9]}
            />
            <Text color={"blue"} weight={"bold"} transform={"uppercase"}>
              Getion des strucutres
            </Text>
          </Group>
          {/* <Text color={"blue"} weight={"bold"} transform={"uppercase"}>
            Choix de l'organisation
          </Text> */}

          <Group style={{ width: "50%" }}>
            <Text color={"blue"} weight={"bold"}>
              Sélectionner la structure
            </Text>
            <Select
              style={{ minWidth: "50%" }}
              placeholder="Sélectionner la structure"
              searchable
              clearable
              data={locationSelectList}
              value={selectedLocation}
              onChange={setSelectedLocation}
            />
          </Group>
        </Group>
      </Card.Section>
      <Card.Section>
        <Divider my={"xs"} color={theme.colors.blue[1]} />
      </Card.Section>

      <Grid columns={5}>
        {/* <Grid.Col span={1}>
          <Text color={"blue"} weight={"bold"}>
            Choix de l'organisation
          </Text>

          <Select
            searchable
            clearable
            data={locationSelectList}
            value={selectedLocation}
            onChange={setSelectedLocation}
          />
        </Grid.Col> */}
        <Grid.Col span={3}>
          <Card
            style={{
              border: 1,
              borderStyle: "solid",
              borderColor: theme.colors.blue[1],
            }}
            mt={"xs"}
          >
            <Text color={"blue"} weight={"bold"} transform={"uppercase"}>
              Gestion du site ou district
            </Text>
            <Card.Section>
              <Divider my={"sm"} color={"blue"} />
            </Card.Section>
            {!location ? (
              <Alert>
                <Center style={{ height: "5vh" }}>
                  Veuillez sélectionner une structure à gauche
                </Center>
              </Alert>
            ) : (
              <>
                <Group>
                  <Text color={"gray"}>Nom de la structure</Text>
                  <Text color={"blue"} weight={"bold"}>
                    {location.name}
                  </Text>
                  <Text color={"gray"}>Code</Text>
                  <Text color={"blue"} weight={"bold"}>
                    {code ? code.value : "Aucun"}
                  </Text>
                </Group>
                <Group>
                  <Text color={"gray"}>Structure parent</Text>
                  <Text color={"blue"} weight={"bold"}>
                    {location.parentLocation.name}
                  </Text>
                </Group>

                <Divider my={"xl"} color={"blue"} />
                <Group>
                  <Text color={"gray"}>CLient direct </Text>
                  <Switch
                    size="xl"
                    checked={checkedDirectClient}
                    onChange={setCheckedDirectClient}
                    onLabel=" OUI"
                    offLabel="NON"
                    onBlur={saveLocationIsDirectClient}
                  />
                  <Space />
                  <Text color={"gray"}>Programmes </Text>
                  <MultiSelect
                    data={programSelectListName}
                    value={selectedPrograms}
                    onChange={setSelectedPrograms}
                    searchable
                    clearable
                    onBlur={saveLocationPrograms}
                  />
                </Group>

                <Divider my={"xl"} color={"blue"} />
                <Text size="xl" color={"blue"}>
                  Strutures enfants
                </Text>
                {location &&
                  location.childLocations &&
                  location.childLocations.map((l: Location) => (
                    <ChildLocationPad key={l.uuid} locationUuid={l.uuid} />
                  ))}
              </>
            )}
          </Card>
        </Grid.Col>
        <Grid.Col span={2}>
          <Card
            style={{
              border: 1,
              borderStyle: "solid",
              borderColor: theme.colors.blue[1],
            }}
            mt={"xs"}
          >
            <Text color={"blue"} weight={"bold"} transform={"uppercase"}>
              Prescripteurs
            </Text>
            <Card.Section>
              <Divider my={"sm"} color={"blue"} />
            </Card.Section>
          </Card>
        </Grid.Col>
      </Grid>
    </Card>
  );
};

export default LocationConfigurationPage;
