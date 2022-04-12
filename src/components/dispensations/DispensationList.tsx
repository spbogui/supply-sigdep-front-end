import { faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Card,
  Group,
  Button,
  Divider,
  Alert,
  useMantineTheme,
  Text,
} from "@mantine/core";
import React from "react";
import { ProductOperation } from "../../models/ProductOperation";
import CustomTable from "../tables/CustomTable";

type DispensationListProps = {
  dispensations: ProductOperation[];
  tableHooks: any;
  columns: any;
};
const DispensationList = (props: DispensationListProps) => {
  const { dispensations, tableHooks, columns } = props;
  const theme = useMantineTheme();

  return (
    <Card>
      <Card.Section>
        <Group
          m={"md"}
          position="apart"
          style={{ marginBottom: 5, marginTop: theme.spacing.sm }}
        >
          <FontAwesomeIcon
            icon={faList}
            size={"2x"}
            color={theme.colors.blue[7]}
          />
          <Text
            weight={500}
            transform={"uppercase"}
            color={theme.colors.blue[7]}
          >
            Dispensations du jour
          </Text>
          <Button leftIcon={<FontAwesomeIcon icon={faList} />}>
            Voir historique
          </Button>
        </Group>
      </Card.Section>
      <Card.Section>
        <Divider my={"xs"} />
      </Card.Section>
      {dispensations.length > 0 ? (
        <CustomTable
          data={dispensations}
          columns={columns}
          initialState={{ hiddenColumns: ["Uuid", "parent", "type"] }}
          tableHooks={tableHooks}
        />
      ) : (
        <Alert color={"red"} style={{ textAlign: "center" }}>
          <Text size={"lg"} color={"red"}>
            Vous n'avez aucune dispensation ce jour
          </Text>
        </Alert>
      )}
    </Card>
  );
};

export default DispensationList;
