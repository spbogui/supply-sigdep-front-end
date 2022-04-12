import {
  faEdit,
  faEye,
  faTrash,
  faExclamationTriangle,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Group,
  Button,
  Alert,
  Card,
  Text,
  Divider,
  Select,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { TRANSFER_LIST_COLUMNS } from "../../../components/tables/columns/transfer";
import CustomTable from "../../../components/tables/CustomTable";
import HeaderForm from "../../../components/transfers/TransferHeaderForm";
import { useUserContext } from "../../../hooks/context";
import {
  useGetTypesOperations,
  useOperationMutation,
} from "../../../hooks/operation";
import { useLocationPrograms } from "../../../hooks/product";
import { ProductOperation } from "../../../models/ProductOperation";

const transferInTypeUuid = "TRANSFERINOOOOOOOOOOOOOOOOOOOOOOOOOOOO";
const transferOutTypeUuid = "TRANSFEROUTOOOOOOOOOOOOOOOOOOOOOOOOOOO";

const TransferPage = () => {
  const [selectedProgram, setSelectedProgram] = useState<string>("");

  const { isDirectClient, isSystemDeveloper } = useUserContext();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { operations, isLoading } = useGetTypesOperations([
    transferOutTypeUuid,
    transferInTypeUuid,
  ]);

  const { programSelectList } = useLocationPrograms();

  const columns = useMemo(() => TRANSFER_LIST_COLUMNS, []);

  const transfers = useMemo(() => operations, [operations]);

  const { removeOperation } = useOperationMutation();

  const handleProgramSelected = (value: string | null) => {
    if (value) {
      setSelectedProgram(value);
    } else {
      setSelectedProgram("");
    }
  };

  useEffect(() => {
    if (!isDirectClient && !isSystemDeveloper) {
      navigate("/supply");
    }
  }, [isDirectClient, isSystemDeveloper, navigate]);

  const tableHooks = (hooks: any) => {
    hooks.visibleColumns.push((columns: any) => [
      ...columns,
      {
        id: "Menu",
        Header: "",
        accessor: (data: ProductOperation) => data.operationStatus,
        with: 10,
        maxWidth: 10,
        Cell: (data: any) => (
          <Group>
            <Button
              compact
              variant={"subtle"}
              onClick={() =>
                navigate(
                  `/supply/transfer/${data.row.values.Uuid}/${
                    data.row.values["type"] &&
                    data.row.values["type"].includes("IN")
                      ? "IN"
                      : "OUT"
                  }`
                )
              }
            >
              <FontAwesomeIcon
                icon={data.row.values["Statut"] !== "VALIDÉ" ? faEdit : faEye}
                size={"2x"}
              />
            </Button>
            {data.row.values["Statut"] !== "VALIDÉ" && (
              <Button
                compact
                variant={"subtle"}
                onClick={() =>
                  removeOperation(data.row.values.Uuid, {
                    onSuccess: () => {
                      queryClient.invalidateQueries("transfer");
                    },
                  })
                }
                color={"red"}
              >
                <FontAwesomeIcon icon={faTrash} size={"2x"} />
              </Button>
            )}
          </Group>
        ),
      },
    ]);
  };

  return (
    <Card>
      <Group position={"apart"}>
        <Group>
          <FontAwesomeIcon icon={faWarehouse} size="2x" color="green" />
          <Text size="xl" color={"green"}>
            Transferts
          </Text>
        </Group>
        {programSelectList && programSelectList.length === 0 && (
          <Alert
            color={"red"}
            variant={"filled"}
            icon={<FontAwesomeIcon icon={faExclamationTriangle} />}
          >
            Vous n'avez aucun programme
          </Alert>
        )}
        <Select
          searchable={true}
          clearable={true}
          onChange={(v) => handleProgramSelected(v)}
          style={{ paddingLeft: 5, paddingRight: 5, width: "30%" }}
          placeholder="Selectionner le programme pour ajouter"
          data={programSelectList}
        />
      </Group>
      {selectedProgram && (
        <HeaderForm program={selectedProgram} mode={"edit"} isEditable={true} />
      )}

      <Divider my={"md"} color={"green"} />

      {!isLoading &&
        (transfers && transfers.length > 0 ? (
          <CustomTable
            data={transfers}
            columns={columns}
            initialState={{
              hiddenColumns: ["Uuid", "children", "parent", "type"],
            }}
            tableHooks={tableHooks}
          />
        ) : (
          <Alert color={"red"} style={{ textAlign: "center" }}>
            Veuillez saisir votre première réception SVP
          </Alert>
        ))}
    </Card>
  );
};

export default TransferPage;
