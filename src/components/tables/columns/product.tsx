import { Badge, Text } from "@mantine/core";
import { Column } from "react-table";
import {
  Product,
  ProductPrice,
  ProductProgram,
  ProductRegime,
} from "../../../models/Product";

export const PRODUCT_COLUMNS: Column<Product>[] = [
  {
    Header: "Uuid",
    accessor: (data) => (data.uuid ? data.uuid : ""),
    width: 100,
  },
  {
    Header: "Code",
    accessor: (data) => data.code,
    // Cell: ({ row }) => row.value,
    width: 100,
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
    accessor: (data) => data.packagingName,
    width: "28%",
  },
  {
    Header: "Unité",
    accessor: (data) =>
      data.names
        .filter((name) => name.productNameType === "PACKAGING")
        .map((name) => name.unit.name),
    width: 100,
  },
  {
    Header: "Designation de dispensation",
    accessor: (data) => data.dispensationName,
    width: "28%",
  },
  {
    Header: "Unité de dispensation",
    accessor: (data) =>
      data.names
        .filter((name) => name.productNameType === "DISPENSATION")
        .map((name) => name.unit.name),
    width: 100,
  },
  {
    Header: "Convertion",
    accessor: (data) => data.conversionUnit,
    width: 100,
    Cell: (data: any) => {
      return (
        <Badge style={{ textAlign: "center" }} size={"sm"}>
          {data.row.values["Convertion"]}
        </Badge>
      );
    },
  },
  {
    Header: "Programmes",
    accessor: (data) =>
      data.programs ? data.programs.map((p) => p.name).join(",") : "",
    width: 180,
    // Cell: (data: any) => {
    //   return (
    //     <Text style={{ textAlign: "center" }} size={"sm"}>
    //       {data.row.values["Programmes"] && data.row.values["Programmes"] !== ""
    //         ? data.row.values["Programmes"]
    //             .split(",")
    //             .map((p: string) => <Badge>{p}</Badge>)
    //         : ""}
    //     </Text>
    //   );
    // },
  },
  {
    Header: "Régimes",
    accessor: (data) =>
      data.regimes ? data.regimes.map((r) => r.concept.display).join(",") : "",
    width: 180,
    Cell: (data: any) => {
      return (
        <Text style={{ textAlign: "center" }} size={"sm"}>
          {data.row.values["Régimes"]
            ? data.row.values["Régimes"]
                .split(",")
                .map((p: string) => <Badge>{p}</Badge>)
            : ""}
        </Text>
      );
    },
  },
  {
    Header: "Prix",
    accessor: (data) => (data.prices ? data.prices : ""),
    width: 180,
    Cell: (data: any) => {
      return (
        <Text style={{ textAlign: "center" }} size={"sm"}>
          {data.row.values["Prix"] && data.row.values["Prix"] !== ""
            ? data.row.values["Prix"].map((p: ProductPrice) => (
                <Badge color={p.active ? "green" : "gray"}>{p.salePrice}</Badge>
              ))
            : ""}
        </Text>
      );
    },
  },
];
