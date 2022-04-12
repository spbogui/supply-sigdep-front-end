import {
  Card,
  Center,
  Grid,
  Loader,
  MultiSelect,
  TextInput,
  useMantineTheme,
  Text,
} from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import React, { useEffect } from "react";
import { useFindLocation, useFindLocationAttributes } from "../hooks/location";
import { useLocationPrograms } from "../hooks/product";

type ChildLocationPadProps = {
  locationUuid: string;
};
const ChildLocationPad = (props: ChildLocationPadProps) => {
  const { locationUuid } = props;
  const theme = useMantineTheme();
  const [code, setCode] = useInputState<string>("");

  const { location } = useFindLocation(locationUuid, true, "v=full");
  const { programSelectList } = useLocationPrograms();
  const { attributes, getLocationAttributes } = useFindLocationAttributes(
    locationUuid,
    "v=full",
    true
  );

  useEffect(() => {
    if (location) {
      setCode(location.postalCode);
    }
  }, [location, setCode]);

  return (
    <Card
      style={{
        border: 1,
        borderStyle: "solid",
        borderColor: theme.colors.blue[1],
      }}
      my={"xs"}
      shadow={"xs"}
      p={"xs"}
    >
      {!location ? (
        <Center style={{ height: 50 }}>
          <Loader />
        </Center>
      ) : (
        <Grid columns={8} align="center">
          <Grid.Col span={4}>
            <Text color={"blue"} size={"md"}>
              {location.name}
            </Text>
          </Grid.Col>
          <Grid.Col span={3}>
            <MultiSelect data={programSelectList} />
          </Grid.Col>
          <Grid.Col span={1}>
            <TextInput placeholder="Code" value={code} onChange={setCode} />
          </Grid.Col>
        </Grid>
      )}
    </Card>
  );
};

export default ChildLocationPad;
