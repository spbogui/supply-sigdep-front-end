import { Text } from "@mantine/core";
import dayjs from "dayjs";
import { Column } from "react-table";
import {
  ProductOperation,
  ProductOperationFlux,
} from "../../../models/ProductOperation";
import { Fn } from "../../../utils/Fn";

export const PRODUCT_COLUMNS: Column<ProductOperationFlux>[] = [
  {
    Header: "Uuid",
    accessor: (data) => (data.uuid ? data.uuid : ""),
    width: 100,
  },
  {
    Header: "AttributeUuid",
    accessor: (data) =>
      Fn.extractInformation(data.attributes, data.product.uuid, "uuid"),
    width: 100,
  },
  {
    Header: "Produit",
    columns: [
      {
        Header: "Code",
        accessor: (data) => data.product.code,
        // Cell: ({ row }) => row.value,
        width: "",
        Cell: (data: any) => {
          return (
            <Text style={{ textAlign: "center" }} size={"sm"}>
              {data.row.values["Code"]}
            </Text>
          );
        },
      },
      {
        Header: "Designation",
        accessor: (data) => data.product.dispensationName,
        width: "28%",
      },
      {
        Header: "Unité",
        accessor: (data) =>
          data.product.names
            .filter((name) => name.productNameType === "DISPENSATION")
            .map((name) => name.unit.name),
      },
    ],
  },
];

export const PRODUCT_BATCH_NUMBER: Column<ProductOperationFlux>[] = [
  ...PRODUCT_COLUMNS,
  {
    Header: "Numéro de lot",
    accessor: (data) =>
      data.attributes
        ? data.attributes.filter(
            (a) => a.attribute.product.uuid === data.product.uuid
          )[0].attribute.batchNumber
        : "",
    width: 150,
  },
  {
    Header: "Date de péremption",
    accessor: (data) =>
      dayjs(
        Fn.extractInformation(data.attributes, data.product.uuid, "attribute")
          .expiryDate
      ).format("DD/MM/YYYY"),
    width: 180,
    Cell: (data: any) => {
      return (
        <Text style={{ textAlign: "center" }} size={"sm"}>
          {data.row.values["Date de péremption"]}
        </Text>
      );
    },
  },
];

export const LIST_COLUMNS: Column<ProductOperation>[] = [
  {
    Header: "Uuid",
    accessor: (data) => (data.uuid ? data.uuid : ""),
    width: 100,
  },
  {
    Header: "type",
    accessor: (data) =>
      data.operationType.uuid ? data.operationType.uuid : "",
    width: 100,
  },
  {
    Header: "parent",
    accessor: (data) =>
      data.parentOperation && data.parentOperation.uuid
        ? data.parentOperation.uuid
        : "",
    width: 100,
  },
  {
    Header: "Date",
    accessor: (data) => dayjs(data.operationDate).format("DD/MM/YYYY"),
    width: 180,
    Cell: (data: any) => {
      return (
        <Text style={{ textAlign: "center" }} size={"sm"}>
          {data.row.values["Date"]}
        </Text>
      );
    },
  },
  {
    Header: "Programme",
    accessor: (data) => data.productProgram.name,
    width: 100,
    Cell: (data: any) => {
      return (
        <Text style={{ textAlign: "center" }} size={"sm"}>
          {data.row.values["Programme"]}
        </Text>
      );
    },
  },
  {
    Header: "Statut",
    accessor: (row) => {
      return row.operationStatus === "NOT_COMPLETED"
        ? "SAISIE EN COURS"
        : row.operationStatus === "AWAITING_VALIDATION"
        ? "EN ATTENTE DE VALIDATION"
        : row.operationStatus === "VALIDATED"
        ? "VALIDÉ"
        : "";
    },
    Cell: (data: any) => {
      return (
        <Text style={{ textAlign: "center" }} size={"sm"}>
          {data.row.values["Statut"]}
        </Text>
      );
    },
  },
];
