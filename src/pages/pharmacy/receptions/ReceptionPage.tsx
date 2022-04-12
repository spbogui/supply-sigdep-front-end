import {
  faArrowCircleLeft,
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
  Dialog,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "react-query";
import CustomTable from "../../../components/tables/CustomTable";
import { useNavigate } from "react-router-dom";
import {
  ProductOperation,
  ProductOperationSave,
} from "../../../models/ProductOperation";
import { RECEPTION_LIST_COLUMNS } from "../../../components/tables/columns/reception";
import HeaderForm from "../../../components/receptions/ReceptionHeaderForm";
import {
  useFindOperation,
  useGetOperations,
  useOperationMutation,
} from "../../../hooks/operation";
import { useLocationPrograms } from "../../../hooks/product";
import { DatePicker } from "@mantine/dates";
import { useInputState } from "@mantine/hooks";
import dayjs from "dayjs";
import { Incidence, OperationStatus } from "../../../models/enums";
import { useUserContext } from "../../../hooks/context";

const operationTypeUuid = "RECEPTIONOOOOOOOOOOOOOOOOOOOOOOOOOOOOO";
const receptionReturnTypeUuid = "RECEPTIONRETURNOOOOOOOOOOOOOOOOOOOOOOO";

const ReceptionPage = () => {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedOperationUuid, setSelectedOperationUuid] =
    useState<string>("");
  const [opened, setOpened] = useState(false);
  const [operationDate, setOperationDate] = useInputState<Date>(
    dayjs(new Date()).toDate()
  );

  const [returnMinDate, setReturnMinDate] = useState<Date>(
    dayjs(new Date()).toDate()
  );

  const { relatedLocation } = useUserContext();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { operations, getOperations, isLoading } =
    useGetOperations(operationTypeUuid);

  const { operation, getOperation } = useFindOperation(
    selectedOperationUuid,
    "reception",
    false
  );
  const { programSelectList } = useLocationPrograms();

  const columns = useMemo(() => RECEPTION_LIST_COLUMNS, []);

  const receptions = useMemo(() => operations, [operations]);

  const { removeOperation, saveOperation } = useOperationMutation();

  const handleProgramSelected = (value: string | null) => {
    if (value) {
      setSelectedProgram(value);
    } else {
      setSelectedProgram(null);
    }
  };

  const handleCreateOperation = () => {
    if (operation) {
      const relatedOperation: ProductOperationSave = {
        operationDate,
        operationType: receptionReturnTypeUuid,
        operationStatus: OperationStatus.NOT_COMPLETED,
        operationNumber: operation.operationNumber,
        location: operation.location.uuid,
        productProgram: operation.productProgram.uuid,
        parentOperation: operation.uuid,
        incidence: Incidence.NEGATIVE,
        exchangeLocation: relatedLocation,
        quantityType: operation.quantityType,
      };

      saveOperation(relatedOperation, {
        onSuccess: (data: ProductOperation) => {
          if (data) {
            setOpened(false);
            navigate(`/supply/reception/${data.uuid}`);
          }
        },
      });
    }
  };

  useEffect(() => {
    if (selectedOperationUuid !== "") {
      getOperation();
      if (operation) {
        if (
          operation.childrenOperation &&
          operation.childrenOperation.length > 0
        ) {
          navigate(`/supply/reception/${operation.childrenOperation[0].uuid}`);
        }
        setOpened(true);
        setReturnMinDate(dayjs(operation.operationDate).toDate());
      }
    }
  }, [getOperation, navigate, operation, selectedOperationUuid]);

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
                navigate(`/supply/reception/${data.row.values.Uuid}`)
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
                      queryClient.invalidateQueries("reception");
                    },
                  })
                }
                color={"red"}
              >
                <FontAwesomeIcon icon={faTrash} size={"2x"} />
              </Button>
            )}

            {data.row.values["Statut"] === "VALIDÉ" && (
              <Button
                compact
                variant={"subtle"}
                onClick={() => {
                  setSelectedOperationUuid(data.row.values.Uuid);
                }}
                color={
                  data.row.values.children === "VALIDATED"
                    ? "blue"
                    : data.row.values.children === "NOT_COMPLETED"
                    ? "orange"
                    : data.row.values.children === "AWAITING_VALIDATION"
                    ? "red"
                    : "gray"
                }
              >
                <FontAwesomeIcon icon={faArrowCircleLeft} size={"2x"} />
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
            Réceptions
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
        (receptions && receptions.length > 0 ? (
          <CustomTable
            data={receptions}
            columns={columns}
            initialState={{ hiddenColumns: ["Uuid", "children"] }}
            tableHooks={tableHooks}
          />
        ) : (
          <Alert color={"red"} style={{ textAlign: "center" }}>
            Veuillez saisir votre première réception SVP
          </Alert>
        ))}
      <Dialog
        opened={opened}
        withCloseButton
        onClose={() => setOpened(false)}
        size="lg"
        radius="md"
      >
        <Text size="sm" style={{ marginBottom: 10 }} weight={500}>
          Saisir la date du retour
        </Text>

        <Group align="flex-end">
          <DatePicker
            value={operationDate}
            onChange={setOperationDate}
            minDate={returnMinDate}
            maxDate={dayjs(new Date()).toDate()}
            placeholder="Date de retour"
            locale="fr"
            inputFormat="DD/MM/YYYY"
            style={{ flex: 1 }}
          />
          <Button onClick={handleCreateOperation}>Saisir les produits</Button>
        </Group>
      </Dialog>
    </Card>
  );
};

export default ReceptionPage;
