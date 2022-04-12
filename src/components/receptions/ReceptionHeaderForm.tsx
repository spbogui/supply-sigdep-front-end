import { useEffect } from "react";
import { DatePicker } from "@mantine/dates";
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
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Info from "../Info";
import { useForm } from "@mantine/form";
import {
  useFindFilteredOperation,
  useFindOperationType,
  useOperationMutation,
} from "../../hooks/operation";
import { useFindProgram } from "../../hooks/product";
import { useUserContext } from "../../hooks/context";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { OperationType } from "../../utils/constants";

dayjs.extend(isSameOrBefore);

type HeaderFormProps = {
  program: string;
  mode: string;
  isEditable: boolean;
  operation?: ProductOperation;
};

// const OperationType.RECEPTION = "RECEPTIONOOOOOOOOOOOOOOOOOOOOOOOOOOOOO";
// const OperationType.DISTRIBUTION = "DISTRIBUTIONOOOOOOOOOOOOOOOOOOOOOOOO";
// const OperationType.INVENTORY = "INVENTORYOOOOOOOOOOOOOOOOOOOOOOOOOOOOO";

const HeaderForm = (props: HeaderFormProps) => {
  const { program, operation, mode } = props;
  const {
    userLocation,
    // isSystemDeveloper,
    // hasPrivileges,
    relatedLocation,
  } = useUserContext();

  // console.log(relatedLocation);

  // const [currentOperationNumber, setCurrentOperationNumber] =
  //   useState<string>("");

  const form = useForm<{
    operationDate: Date | string | undefined;
    operationNumber: string;
    // receptionType: string;
    observation: string | undefined;
    quantityType: "DISPENSATION" | "PACKAGING";
  }>({
    initialValues: {
      operationDate: "",
      operationNumber: "",
      // receptionType: "",
      observation: "",
      quantityType: "DISPENSATION",
    },
    validate: (values) => ({
      operationDate: values.operationDate === "" ? "Champ requis" : null,
      operationNumber: values.operationNumber === "" ? "Champ requis" : null,
      // receptionType: values.receptionType === "" ? "Champ requis" : null,
    }),
  });

  const navigate = useNavigate();

  const { operationType: type } = useFindOperationType(OperationType.RECEPTION);
  const { operation: latestInventory } = useFindFilteredOperation(
    OperationType.INVENTORY,
    "last:validated",
    program
  );
  const { operation: latestReception } = useFindFilteredOperation(
    OperationType.RECEPTION,
    "last:validated",
    program
  );
  const { operation: editing } = useFindFilteredOperation(
    OperationType.RECEPTION,
    "last",
    program
  );

  const { productProgram } = useFindProgram(program);

  const incidence = type ? type.defaultIncidence : undefined;

  const {
    operation: relatedDistribution,
    getOperation: getRelatedDistribution,
  } = useFindFilteredOperation(
    OperationType.DISTRIBUTION,
    `operationNumber:${form.values.operationNumber}`,
    program,
    `location=${relatedLocation}&v=full`,
    false
  );

  const { saveOperation } = useOperationMutation();

  // const handleSetDefaultValues = useCallback(() => {

  // }, [form, operation]);

  useEffect(() => {
    // handleSetDefaultValues();
    if (editing && mode !== "view") {
      navigate(`/supply/reception/${editing.uuid}`);
    }
    if (operation) {
      form.setValues((currentValues) => ({
        ...currentValues,
        operationDate: dayjs(operation.operationDate).toDate(),
        operationNumber: operation.operationNumber
          ? operation.operationNumber
          : "",
        receptionType: operation.operationType.uuid
          ? operation.operationType.uuid
          : "",
        observation: operation.observation ? operation.observation : "N/R",
      }));
    }
  }, [editing, mode, navigate, operation]);

  const handleSubmit = (values: typeof form["values"]) => {
    if (form.validate()) {
      const location = userLocation.uuid;
      const productOperation: ProductOperationSave = {
        operationDate: dayjs(values.operationDate).toDate(),
        operationNumber: values.operationNumber,
        productProgram: program,
        quantityType:
          values.quantityType === "DISPENSATION"
            ? QuantityType.DISPENSATION
            : QuantityType.PACKAGING,
        operationStatus: OperationStatus.NOT_COMPLETED,
        incidence,
        operationType: OperationType.RECEPTION,
        location,
        observation: values.observation,
        exchangeLocation: relatedLocation,
      };

      if (relatedDistribution) {
        if (latestInventory) {
          if (
            dayjs(latestInventory.operationDate).isSameOrBefore(
              dayjs(relatedDistribution.operationDate)
            )
          ) {
            productOperation.parentOperation = relatedDistribution.uuid;
            productOperation.observation =
              "Depuis une distribution : " + values.operationNumber;
          }
        }
      }

      saveOperation(productOperation, {
        onSuccess: (operation) => {
          navigate(`/supply/reception/${operation.uuid}`);
        },
      });
    }
  };

  const handleFindRelatedDistribution = () => {
    if (form.values.operationNumber !== "") {
      getRelatedDistribution();
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
        {operation ? (
          <Group>
            <Info label={"Programme"} value={operation.productProgram.name} />
            <Info
              label={"Date de la réception"}
              value={operation.operationDate}
            />

            <Info
              label={"Structure de livraison"}
              value={
                operation.exchangeLocation
                  ? operation.exchangeLocation.name
                  : ""
              }
            />
            <Info
              label={"Bordereau de livraison"}
              value={operation.operationNumber}
            />
            <Info
              label={"Type de quantité"}
              value={
                operation.quantityType !== "DISPENSATION"
                  ? "CONDITIONNEMENT"
                  : operation.quantityType
              }
            />
            <Info label={"Observation"} value={operation.observation} />
          </Group>
        ) : (
          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <Group direction={mode === "edit" ? "row" : "column"}>
              <Alert title={"Programme"} variant="filled">
                <Badge color={"green"} size={"lg"}>
                  {productProgram?.name}
                </Badge>
              </Alert>

              <DatePicker
                placeholder="Date de la réception"
                inputFormat="DD/MM/YYYY"
                locale="fr"
                label="Date de réception"
                required
                style={mode === "edit" ? {} : { width: "100%" }}
                {...form.getInputProps("operationDate")}
                maxDate={dayjs(new Date()).toDate()}
                minDate={
                  latestReception
                    ? dayjs(latestReception?.operationDate).toDate()
                    : latestInventory
                    ? dayjs(latestInventory.operationDate).toDate()
                    : dayjs(new Date()).add(-3, "year").toDate()
                }
                icon={<FontAwesomeIcon icon={faCalendar} />}
              />
              <TextInput
                label="Bordereau de livraison"
                required
                placeholder="Bordereau de livraison"
                {...form.getInputProps("operationNumber")}
                onBlur={handleFindRelatedDistribution}
              />

              <RadioGroup
                label="Type de quantité"
                size={"sm"}
                required
                {...form.getInputProps("quantityType")}
                pb={"md"}
              >
                <Radio value={"DISPENSATION"} label={"Dispensation"} pt={"5"} />
                <Radio value={"PACKAGING"} label={"Conditionnement"} />
              </RadioGroup>

              <TextInput
                label="Observation"
                style={{ width: "30%" }}
                placeholder="Observation sur la réception"
                {...form.getInputProps("observation")}
              />
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

export default HeaderForm;
