import { useState, useEffect, useCallback } from "react";
import { DatePicker, getMonthsNames } from "@mantine/dates";
import dayjs from "dayjs";
import { OperationStatus, QuantityType } from "../../models/enums";
import {
  ProductOperation,
  ProductOperationSave,
} from "../../models/ProductOperation";
import {
  Badge,
  Button,
  Divider,
  Group,
  Radio,
  RadioGroup,
  TextInput,
  Alert,
  Card,
  Select,
  Box,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { Fn } from "../../utils/Fn";
import { useNavigate } from "react-router-dom";
import { getYearsRange } from "@mantine/dates";
import Info from "../Info";
import { useForm } from "@mantine/form";
import {
  useFindFilteredOperation,
  useFindOperationType,
  useOperationMutation,
} from "../../hooks/operation";
import { useFindProgram } from "../../hooks/product";
import { OperationAttributeType, OperationType } from "../../utils/constants";
import { useUserContext } from "../../hooks/context";

type InventoryHeaderFormProps = {
  program: string;
  handleIsSaved: () => void;
  handleIsSaving: () => void;
  mode: string;
  isEditable?: boolean;
  inventory?: ProductOperation;
};

const InventoryHeaderForm = (props: InventoryHeaderFormProps) => {
  const { userLocation } = useUserContext();
  const navigate = useNavigate();
  const { program, mode, inventory } = props;
  const [inventoryType, setInventoryType] = useState("TOTAL");

  const { operationType: type } = useFindOperationType(OperationType.INVENTORY);
  const { operation: latestInventory } = useFindFilteredOperation(
    OperationType.INVENTORY,
    "last:validated",
    program
  );
  const { operation: editing } = useFindFilteredOperation(
    OperationType.INVENTORY,
    "last",
    program
  );

  const { productProgram } = useFindProgram(program);

  const incidence = type ? type.defaultIncidence : undefined;

  // const saveOperation = useMutation(OperationService.save);

  const { saveOperation } = useOperationMutation();

  const form = useForm<{
    operationDate: Date | string | undefined;
    operationNumber: string;
    month: string;
    year: string;
    inventoryType: string;
    observation: string | undefined;
  }>({
    initialValues: {
      operationDate: "",
      operationNumber: "",
      month: "",
      year: "",
      inventoryType: "TOTAL",
      observation: "",
    },
    validate: (values) => ({
      operationDate: values.operationDate === "" ? "La date est requise" : null,
      // operationNumber:
      //   values.operationNumber === "" ? "le numerest requise" : null,
      month: values.month === "" ? "Le mois est requis" : null,
      year: values.year === "" ? "L'année est requise" : null,
    }),
  });

  const handleSetDefaultValues = useCallback(
    (inventory: ProductOperation) => {
      if (
        form.values.operationNumber === "" ||
        form.values.operationNumber !== inventory.operationNumber
      ) {
        form.setValues((currentValues) => ({
          ...currentValues,
          operationDate: dayjs(inventory.operationDate).toDate(),
          operationNumber: inventory.operationNumber
            ? inventory.operationNumber
            : "",
          month: inventory.operationNumber
            ? inventory.operationNumber.split("-")[1].split(" ")[0]
            : "",
          year: inventory.operationNumber
            ? inventory.operationNumber.split("-")[1].split(" ")[1]
            : "",
          inventoryType,
          observation: inventory.observation ? inventory.observation : "",
        }));
      }
    },
    [inventoryType]
  );

  // console.log("week days names");

  const monthNames = getMonthsNames("fr", "MMMM").map((month: string) => {
    const uMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return { value: uMonth, label: uMonth };
  });

  const yearFrom = latestInventory
    ? dayjs(latestInventory.operationDate).year()
    : 2018;

  const years = getYearsRange({
    from: yearFrom,
    to: dayjs(new Date()).year(),
  }).map((y) => {
    return { value: y.toString(), label: y.toString() };
  });

  years.sort((a, b) => (a < b ? 1 : -1));

  useEffect(() => {
    if (editing) {
      navigate(`/supply/inventory/${editing.uuid}`);
    }

    if (inventory) {
      // if (inventory.operationStatus === "NOT_COMPLETED") {
      //   handleSetDefaultValues(inventory);
      // }
      if (inventory.attributes) {
        const extractedInventoryType = Fn.getAttributeValue(
          inventory.attributes,
          OperationAttributeType.INVENTORY_TYPE
        );
        if (extractedInventoryType) {
          setInventoryType(extractedInventoryType);
        }
      }
    }
  }, [inventory, editing, navigate]);

  const handleSubmit = (values: typeof form["values"]) => {
    // console.log(values);
    if (form.validate()) {
      const location = userLocation ? userLocation.uuid : "";
      const productOperation: ProductOperationSave = {
        operationDate: dayjs(values.operationDate).toDate(),
        operationNumber:
          values.month && values.year
            ? "INVC-" +
              values.month +
              " " +
              values.year +
              (values.inventoryType === "PARTIAL" ? " P" : "")
            : undefined,
        productProgram: program,
        quantityType: QuantityType.DISPENSATION,
        operationStatus: OperationStatus.NOT_COMPLETED,
        incidence,
        operationType: OperationType.INVENTORY,
        attributes: [
          {
            operationAttributeType: "INVENTORYSTARTDATEAAAAAAAAAAAAAAAAAA",
            value: latestInventory
              ? latestInventory.operationDate
              : values.operationDate,
            location,
          },
          {
            operationAttributeType: "INVENTORYTYPEAAAAAAAAAAAAAAAAAAAAAAAAA",
            value: inventoryType,
            location,
          },
        ],
        location,
        observation: values.observation,
      };

      saveOperation(productOperation, {
        onSuccess: (operation) => {
          navigate(`/supply/inventory/${operation.uuid}`);
        },
      });
    }
  };

  return (
    <>
      <Divider my={"md"} color={"green"} />
      <Card
        shadow={"xs"}
        style={{
          width: "100%",
          backgroundColor: "#efefef",
          border: "1px solid green",
        }}
        color="green"
        p={"xs"}
      >
        {inventory ? (
          <Group>
            <Info label={"Programme"} value={inventory.productProgram.name} />
            <Info
              label={"Date de l'inventaire"}
              value={inventory.operationDate}
            />
            <Info label={"Numero de pièce"} value={inventory.operationNumber} />
            {inventory.attributes && (
              <Info
                label={"Type d'inventaire"}
                value={Fn.getAttributeValue(
                  inventory.attributes,
                  "INVENTORYTYPEAAAAAAAAAAAAAAAAAAAAAAAAA"
                )}
              />
            )}

            <Info label={"Observation"} value={inventory.observation} />
          </Group>
        ) : (
          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <Group direction={mode === "edit" ? "row" : "column"}>
              <Alert
                title={productProgram?.name}
                variant="filled"
                style={mode === "edit" ? {} : { width: "100%" }}
              >
                Date Dernier inventaire :{" "}
                <Badge color={latestInventory ? "green" : "red"} size={"lg"}>
                  {latestInventory
                    ? dayjs(latestInventory?.operationDate).format("DD/MM/YYYY")
                    : "Premier"}
                </Badge>
              </Alert>

              <DatePicker
                placeholder="Date de l'inventaire"
                inputFormat="DD/MM/YYYY"
                locale="fr"
                label="Date de fin"
                required
                style={mode === "edit" ? {} : { width: "100%" }}
                {...form.getInputProps("operationDate")}
                maxDate={dayjs(new Date()).toDate()}
                minDate={
                  latestInventory
                    ? dayjs(latestInventory?.operationDate)
                        .add(1, "days")
                        .toDate()
                    : dayjs(new Date()).add(-3, "year").toDate()
                }
                icon={<FontAwesomeIcon icon={faCalendar} />}
              />
              <Box style={{ backgroundColor: "lightgray" }} p={"xs"}>
                <Group spacing={"xs"}>
                  <Select
                    data={monthNames}
                    label={"Mois"}
                    style={{ width: 130 }}
                    {...form.getInputProps("month")}
                  />
                  <Select
                    data={years}
                    label={"Année"}
                    style={{ width: 80 }}
                    {...form.getInputProps("year")}
                  />
                </Group>
              </Box>

              <RadioGroup
                label="Type d'inventaire"
                required
                {...form.getInputProps("inventoryType")}
              >
                <Radio value={"TOTAL"} label={"Total"} mt={5} mb={5} />
                <Radio value={"PARTIAL"} label={"Partiel"} />
              </RadioGroup>

              <TextInput
                label="Observation"
                // disabled={!checked}
                style={{ width: "30%" }}
                placeholder="Observation sur l'inventaire"
                {...form.getInputProps("observation")}
              />
              {/* {JSON.stringify(form)} */}
              <Button type="submit" style={{ marginTop: 25 }}>
                Saisir les produits
              </Button>
            </Group>
          </form>
        )}
      </Card>
    </>
  );
};

export default InventoryHeaderForm;
