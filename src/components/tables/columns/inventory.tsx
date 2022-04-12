import {
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Text } from "@mantine/core";
import { Column } from "react-table";
import {
  ProductOperation,
  ProductOperationFlux,
} from "../../../models/ProductOperation";
import { Fn } from "../../../utils/Fn";
import { LIST_COLUMNS, PRODUCT_BATCH_NUMBER } from "./common";

export const INVENTORY_COLUMNS: Column<ProductOperationFlux>[] = [
  ...PRODUCT_BATCH_NUMBER,
  {
    Header: "Quantité physique",
    accessor: (data) => data.quantity,
    width: 100,
    Cell: (data: any) => {
      return (
        <Text style={{ textAlign: "center" }} size={"sm"}>
          {data.row.values["Quantité physique"]}
        </Text>
      );
    },
  },
  {
    Header: "Quantité Théorique",
    accessor: (data) => data.relatedQuantity,
    width: 100,
    Cell: (data: any) => {
      const qt = data.row.values["Quantité Théorique"];
      const qp = data.row.values["Quantité physique"];

      const diff =
        qp === qt || qt === "" ? "" : (qp > qt ? "+" : "") + (qp - qt);
      return (
        <Text
          style={{ textAlign: "center" }}
          size={"sm"}
          color={diff === "" ? "" : "red"}
        >
          {data.row.values["Quantité Théorique"]}{" "}
          {diff !== "" ? `(${diff})` : ""}
        </Text>
      );
    },
  },
  {
    Header: "Statut",
    accessor: (data) => data.relatedQuantity,
    width: 50,
    Cell: (data: any) => {
      // console.log(data.row.values);
      return (
        <div style={{ textAlign: "center" }}>
          {data.row.values.Statut === null ||
          data.row.values.Statut === data.row.values["Quantité physique"] ? (
            <FontAwesomeIcon color="green" size={"2x"} icon={faCheckCircle} />
          ) : (
            <FontAwesomeIcon
              color="red"
              size={"2x"}
              icon={faExclamationTriangle}
            />
          )}
        </div>
      );
    },
  },
  {
    Header: "Observation",
    accessor: (data) => data.observation,
    width: 250,
  },
];

export const INVENTORY_EDIT_COLUMNS: Column<ProductOperationFlux>[] = [
  ...PRODUCT_BATCH_NUMBER,
];

export const INVENTORY_LIST_COLUMNS: Column<ProductOperation>[] = [
  {
    Header: "Numéro de la pièce",
    accessor: (data) => data.operationNumber,
    width: 100,
  },
  ...LIST_COLUMNS,
  {
    Header: "Type d'inventaire",
    accessor: (data) => {
      if (data.attributes) {
        const attributeFiltered = Fn.getAttributeValue(
          data.attributes,
          "INVENTORYTYPEAAAAAAAAAAAAAAAAAAAAAAAAA"
        );
        if (attributeFiltered) {
          return attributeFiltered === "PARTIAL" ? "PARTIEL" : "TOTAL";
        }
      }
      return "TOTAL";
    },
    width: 100,
    Cell: (data: any) => {
      return (
        <Text style={{ textAlign: "center" }} size={"sm"}>
          {data.row.values["Type d'inventaire"]}
        </Text>
      );
    },
  },
  // {
  //   Header: "Uuid",
  //   accessor: (data) => (data.uuid ? data.uuid : ""),
  //   width: 100,
  // },
  // {
  //   Header: "Date de l'inventaire",
  //   accessor: (data) => dayjs(data.operationDate).format("DD/MM/YYYY"),
  //   width: 180,
  //   Cell: (data: any) => {
  //     return (
  //       <Text style={{ textAlign: "center" }} size={"sm"}>
  //         {data.row.values["Date de l'inventaire"]}
  //       </Text>
  //     );
  //   },
  // },
  // {
  //   Header: "Numéro de la pièce",
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
  //   Header: "Type d'inventaire",
  //   accessor: (data) => {
  //     if (data.attributes) {
  //       const attributeFiltered = Fn.getAttributeValue(
  //         data.attributes,
  //         "INVENTORYTYPEAAAAAAAAAAAAAAAAAAAAAAAAA"
  //       );
  //       if (attributeFiltered) {
  //         return attributeFiltered === "PARTIAL" ? "PARTIEL" : "TOTAL";
  //       }
  //     }
  //     return "TOTAL";
  //   },
  //   width: 100,
  //   Cell: (data: any) => {
  //     return (
  //       <Text style={{ textAlign: "center" }} size={"sm"}>
  //         {data.row.values["Type d'inventaire"]}
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
