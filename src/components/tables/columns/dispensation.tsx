import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, Group, List, Text, ThemeIcon } from "@mantine/core";
import { Column } from "react-table";
import {
  ProductOperation,
  ProductOperationAttribute,
  ProductOperationFlux,
} from "../../../models/ProductOperation";
import { LIST_COLUMNS, PRODUCT_COLUMNS } from "./common";

export const DISPENSATION_FLUX_COLUMNS: Column<ProductOperationFlux>[] = [
  ...PRODUCT_COLUMNS,
  {
    Header: "Quantité dispensée",
    accessor: (data) => data.quantity,
    width: 100,
    Cell: (data: any) => {
      return (
        <Text style={{ textAlign: "center" }} size={"sm"}>
          {data.row.values["Quantité dispensée"]}
        </Text>
      );
    },
  },
  {
    Header: "Quantité demandé",
    accessor: (data) => data.relatedQuantity,
    width: 100,
    Cell: (data: any) => {
      return (
        <Text style={{ textAlign: "center" }} size={"sm"}>
          {data.row.values["Quantité demandé"]}
        </Text>
      );
    },
  },
];

export const DISPENSATION_FLUX_EDIT_COLUMNS: Column<ProductOperationFlux>[] = [
  ...PRODUCT_COLUMNS,
];

export const DISPENSATION_LIST_COLUMNS: Column<ProductOperation>[] = [
  {
    Header: "Numéro du patient",
    accessor: (data) => data.operationNumber,
    width: 100,
  },
  ...LIST_COLUMNS,
  {
    Header: "Information",
    accessor: (data) => (data.attributes ? data.attributes : ""),
    width: 250,
    Cell: (data: any) => {
      if (data.row.values["Dispensation Info"]) {
        return (
          <List
            spacing="xs"
            size="sm"
            center
            icon={
              <ThemeIcon color="teal" size={24} radius="xl">
                <FontAwesomeIcon icon={faCheckCircle} size={"2x"} />
              </ThemeIcon>
            }
          >
            {data.row.values["Dispensation Info"]
              .filter(
                (attribute: ProductOperationAttribute) =>
                  !attribute.operationAttributeType.uuid.includes(
                    "ENCOUNTER"
                  ) &&
                  !attribute.operationAttributeType.uuid.includes("DATE") &&
                  !attribute.operationAttributeType.uuid.includes("PROVIDER") &&
                  !attribute.operationAttributeType.uuid.includes("PATIENT")
              )
              .map((attribute: ProductOperationAttribute) => {
                return (
                  <List.Item>
                    <Group position="apart">
                      {attribute.operationAttributeType.name} :
                      <Badge size="lg" color={"orange"}>
                        {attribute.value}
                      </Badge>
                    </Group>
                  </List.Item>
                );
              })}
          </List>
        );
      }
      return "Aucune";
    },
  },
];
