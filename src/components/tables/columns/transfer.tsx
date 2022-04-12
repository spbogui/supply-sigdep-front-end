import { Text } from "@mantine/core";
import dayjs from "dayjs";
import { Column } from "react-table";
import {
  ProductOperation,
  ProductOperationFlux,
} from "../../../models/ProductOperation";
import { Fn } from "../../../utils/Fn";
import { LIST_COLUMNS } from "./common";

export const TRANSFER_COLUMNS: Column<ProductOperationFlux>[] = [
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
  {
    Header: "Quantité",
    accessor: (data) => data.quantity,
    width: 100,
    Cell: (data: any) => {
      return (
        <Text style={{ textAlign: "center" }} size={"sm"}>
          {data.row.values["Quantité"]}
        </Text>
      );
    },
  },
  {
    Header: "Observation",
    accessor: (data) => data.observation,
    width: 250,
  },
];

export const TRANSFER_EDIT_COLUMNS: Column<ProductOperationFlux>[] = [
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

export const TRANSFER_LIST_COLUMNS: Column<ProductOperation>[] = [
  {
    Header: "Numéro de tranfert",
    accessor: (data) => data.operationNumber,
    width: 100,
  },
  ...LIST_COLUMNS,
  {
    Header: "Type de transfert",
    accessor: (data) =>
      data.operationType.uuid.includes("TRANSFEROUT") ? "SORTANT" : "ENTRANT",
    width: 100,
    Cell: (data: any) => {
      return (
        <Text style={{ textAlign: "center" }} size={"sm"}>
          {data.row.values["Type de transfert"]}
        </Text>
      );
    },
  },
  // {
  //   Header: "parent",
  //   accessor: (data) =>
  //     data.parentOperation && data.parentOperation
  //       ? data.parentOperation.uuid
  //       : "",
  //   width: 100,
  // },
  // {
  //   Header: "Date de la transfert",
  //   accessor: (data) => dayjs(data.operationDate).format("DD/MM/YYYY"),
  //   width: 180,
  //   Cell: (data: any) => {
  //     return (
  //       <Text style={{ textAlign: "center" }} size={"sm"}>
  //         {data.row.values["Date de la réception"]}
  //       </Text>
  //     );
  //   },
  // },
  // {
  //   Header: "Numéro de tranfert",
  //   accessor: (data) => data.operationNumber,
  //   width: 100,
  // },
  // {
  //   Header: "Programme",
  //   accessor: (data) => data.productProgram.name,
  //   width: 100,
  //   Cell: (data: any) => {
  //     return (
  //       <Text style={{ textAlign: "center" }} size={"sm"}>
  //         {data.row.values["Programme"]}
  //       </Text>
  //     );
  //   },
  // },
  // {
  //   Header: "Statut",
  //   accessor: (row) => {
  //     return row.operationStatus === "NOT_COMPLETED"
  //       ? "SAISIE EN COURS"
  //       : row.operationStatus === "AWAITING_VALIDATION"
  //       ? "EN ATTENTE DE VALIDATION"
  //       : row.operationStatus === "VALIDATED"
  //       ? "VALIDÉ"
  //       : "";
  //   },
  //   Cell: (data: any) => {
  //     return (
  //       <Text style={{ textAlign: "center" }} size={"sm"}>
  //         {data.row.values["Statut"]}
  //       </Text>
  //     );
  //   },
  // },
];
