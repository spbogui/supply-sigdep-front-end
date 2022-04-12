import {
  faEdit,
  faExclamationTriangle,
  faEye,
  faTrash,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "dayjs/locale/fr";
import {
  Alert,
  Button,
  Card,
  Divider,
  Group,
  Select,
  Text,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { useQueryClient } from "react-query";
import CustomTable from "../../../components/tables/CustomTable";
import { useNavigate } from "react-router-dom";
import { ProductOperation } from "../../../models/ProductOperation";
import { INVENTORY_LIST_COLUMNS } from "../../../components/tables/columns/inventory";
import InventoryHeaderForm from "../../../components/inventories/InventoryHeaderForm";
import {
  useGetOperations,
  useOperationMutation,
} from "../../../hooks/operation";
import { useLocationPrograms } from "../../../hooks/product";

const operationTypeUuid = "INVENTORYOOOOOOOOOOOOOOOOOOOOOOOOOOOOO";

const InventoryPage = () => {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { operations, getOperations, isLoading } =
    useGetOperations(operationTypeUuid);

  const { programSelectList } = useLocationPrograms();

  const columns = useMemo(() => INVENTORY_LIST_COLUMNS, []);
  const inventories = useMemo(() => operations, [operations]);

  const { removeOperation } = useOperationMutation();

  const handleProgramSelected = (value: string | null) => {
    if (value) {
      setSelectedProgram(value);
    } else {
      setSelectedProgram(null);
    }
  };

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
                navigate(`/supply/inventory/${data.row.values.Uuid}`)
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
                      getOperations();
                      queryClient.invalidateQueries("inventory");
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
            Inventaires
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
        <InventoryHeaderForm
          handleIsSaved={() => console.log("saved")}
          handleIsSaving={() => console.log("is saving")}
          program={selectedProgram}
          mode={"edit"}
          isEditable={true}
        />
      )}

      <Divider my={"md"} color={"green"} />

      {!isLoading &&
        (inventories && inventories.length > 0 ? (
          <CustomTable
            data={inventories}
            columns={columns}
            initialState={{ hiddenColumns: ["Uuid", "parent", "type"] }}
            tableHooks={tableHooks}
          />
        ) : (
          <Alert color={"red"} style={{ textAlign: "center" }}>
            Veuillez saisir votre premier inventaire SVP
          </Alert>
        ))}
    </Card>
  );
};

export default InventoryPage;
