import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  TextInput,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useInputState } from "@mantine/hooks";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../hooks/context";
import { useFindDirectClients } from "../../hooks/location";
import {
  useFindFilteredOperation,
  useFindOperationType,
  useOperationMutation,
} from "../../hooks/operation";
import { useFindProgram } from "../../hooks/product";
import { OperationStatus, QuantityType } from "../../models/enums";
import {
  ProductOperation,
  ProductOperationSave,
} from "../../models/ProductOperation";
import Info from "../Info";

type HeaderFormProps = {
  program: string;
  mode: string;
  isEditable: boolean;
  operation?: ProductOperation;
};

const transferReasonList: SelectItem[] = [
  { value: "Appareil en panne", label: "Appareil en panne" },
  {
    value: "Augmentation de la consommation",
    label: "Augmentation de la consommation",
  },
  { value: "Baisse de la consommation", label: "Baisse de la consommation" },
  {
    value: "Commande non satisfaite pour le produit durant la période",
    label: "Commande non satisfaite pour le produit durant la période",
  },
  { value: "Consommation atypique", label: "Consommation atypique" },
  {
    value: "Contraintes liées au conditionnement (1 diluant pour 1 kit)",
    label: "Contraintes liées au conditionnement (1 diluant pour 1 kit)",
  },
  {
    value: "Echange de produit à peremption proche pour consommation",
    label: "Echange de produit à peremption proche pour consommation",
  },
  {
    value: "Erreur sur les unités de comptage",
    label: "Erreur sur les unités de comptage",
  },
  {
    value: "Livraison Commande Normale + Commande urgente",
    label: "Livraison Commande Normale + Commande urgente",
  },
  {
    value: "Manque de communication entre clients de la même aire sanitaire",
    label: "Manque de communication entre clients de la même aire sanitaire",
  },
  {
    value: "Mauvaise estimation de la CMM",
    label: "Mauvaise estimation de la CMM",
  },
  {
    value: "Mauvaise estimation de la quantité à commander",
    label: "Mauvaise estimation de la quantité à commander",
  },
  {
    value:
      "Mauvaise tenue des fiches de stock (erreur dans les données sources)",
    label:
      "Mauvaise tenue des fiches de stock (erreur dans les données sources)",
  },
  {
    value: "Non promptitude des RM des ESPC",
    label: "Non promptitude des RM des ESPC",
  },
  {
    value: "Non suivi des dates de péremption",
    label: "Non suivi des dates de péremption",
  },
  { value: "Peremption proche", label: "Peremption proche" },
  {
    value: "Probleme lié au conditionnement",
    label: "Probleme lié au conditionnement",
  },
  { value: "Produit à faible rotation", label: "Produit à faible rotation" },

  {
    value:
      "Produit en vente ne reponds pas aux normes de gestion des stocks prescrites",
    label:
      "Produit en vente ne reponds pas aux normes de gestion des stocks prescrites",
  },
  {
    value: "Rationnalisation des stock aux sites ou aux services",
    label: "Rationnalisation des stock aux sites ou aux services",
  },
  {
    value: "Retard de livraison par la NPSP",
    label: "Retard de livraison par la NPSP",
  },
  { value: "Rupture nationale", label: "Rupture nationale" },
  {
    value: "Situation dû à un système d'allocation",
    label: "Situation dû à un système d'allocation",
  },
  {
    value: "Situation dû à une livraision après un transfert in",
    label: "Situation dû à une livraision après un transfert in",
  },
  {
    value: "Structure non habilité à commander ce produit",
    label: "Structure non habilité à commander ce produit",
  },
  {
    value: "Transfert sans évaluation du MSD",
    label: "Transfert sans évaluation du MSD",
  },
  {
    value: "Unité de comptage non adaptée",
    label: "Unité de comptage non adaptée",
  },
  {
    value: "Utilisation des produits PNLS pour d'autres programmes",
    label: "Utilisation des produits PNLS pour d'autres programmes",
  },
  { value: "Autres", label: "Autres" },
];

// const transferInTypeUuid = "TRANSFERINOOOOOOOOOOOOOOOOOOOOOOOOOOOO";
const transferOutTypeUuid = "TRANSFEROUTOOOOOOOOOOOOOOOOOOOOOOOOOOO";
const inventoryTypeUuid = "INVENTORYOOOOOOOOOOOOOOOOOOOOOOOOOOOOO";

const HeaderForm = (props: HeaderFormProps) => {
  const { program, operation, mode } = props;

  const [transferTypeUuid, setTransferTypeUuid] = useInputState<string>("");
  const [transferLocationUuid, setTransferLocationUuid] =
    useInputState<string>("");

  const navigate = useNavigate();

  const {
    userLocation,
    // isSystemDeveloper,
    // hasPrivileges,
    // relatedLocation,
  } = useUserContext();

  const form = useForm<{
    operationDate: Date | string | undefined;
    operationNumber: string;
    transferType: string;
    relatedLocation: string;
    observation: string | undefined;
    quantityType: "DISPENSATION" | "PACKAGING";
  }>({
    initialValues: {
      operationDate: "",
      operationNumber: "",
      transferType: "",
      relatedLocation: "",
      observation: "",
      quantityType: "DISPENSATION",
    },
    validate: (values) => ({
      operationDate: values.operationDate === "" ? "Champ requis" : null,
      operationNumber: values.operationNumber === "" ? "Champ requis" : null,
      transferType: values.transferType === "" ? "Champ requis" : null,
      relatedLocation: values.relatedLocation === "" ? "Champ requis" : null,
    }),
  });

  const { productProgram } = useFindProgram(program);

  const { operationType: type, getOperationType } = useFindOperationType(
    transferTypeUuid,
    "",
    false
  );

  const { operation: latestInventory } = useFindFilteredOperation(
    inventoryTypeUuid,
    "last:validated",
    program
  );

  const { operation: latestTransfer, getOperation: getLastTransfer } =
    useFindFilteredOperation(
      form.values.transferType,
      "last:validated",
      program,
      "",
      false
    );

  const { directClients } = useFindDirectClients(userLocation.uuid);

  // console.log(directClients);

  const { operation: editing, getOperation: getEditing } =
    useFindFilteredOperation(transferTypeUuid, "last", program, "", false);

  const incidence = type ? type.defaultIncidence : undefined;

  const { operation: relatedTransferIn, getOperation: getRelatedTransferIn } =
    useFindFilteredOperation(
      transferOutTypeUuid,
      `operationNumber:${form.values.operationNumber}`,
      program,
      `location=${transferLocationUuid}&v=full`,
      false
    );

  const { saveOperation } = useOperationMutation();

  const handleSubmit = (values: typeof form["values"]) => {
    if (form.validate()) {
      const location = userLocation.uuid;
      const productOperation: ProductOperationSave = {
        operationDate: dayjs(values.operationDate).toDate(),
        operationNumber: values.operationNumber,
        productProgram: program,
        quantityType: QuantityType.DISPENSATION,
        operationStatus: OperationStatus.NOT_COMPLETED,
        incidence,
        operationType: transferTypeUuid,
        location,
        observation: values.observation,
        exchangeLocation: values.relatedLocation,
      };

      if (relatedTransferIn) {
        if (latestInventory) {
          if (
            dayjs(latestInventory.operationDate).isSameOrBefore(
              dayjs(relatedTransferIn.operationDate)
            )
          ) {
            productOperation.parentOperation = relatedTransferIn.uuid;
            productOperation.observation =
              "Depuis un transfert entrant : " + values.operationNumber;
          }
        }
      }
      const type = transferTypeUuid.includes("IN") ? "IN" : "OUT";

      saveOperation(productOperation, {
        onSuccess: (operation) => {
          navigate(`/supply/transfer/${operation.uuid}/${type}`);
        },
      });
    }
  };

  useEffect(() => {
    // handleSetDefaultValues();
    if (editing && mode !== "view") {
      navigate(`/supply/transfer/${editing.uuid}`);
    }
    if (
      transferTypeUuid !== "" &&
      form.values.transferType !== transferTypeUuid
    ) {
      form.values.transferType = transferTypeUuid;
      getOperationType();
      getLastTransfer();
      getEditing();
      if (editing) {
        navigate(
          `/supply/transfer/${editing.uuid}/${
            transferTypeUuid.includes("IN") ? "IN" : "OUT"
          }`
        );
      }
      if (
        transferTypeUuid.includes("TRANSFERIN") &&
        transferLocationUuid !== ""
      ) {
        getRelatedTransferIn();
      }
    }

    if (
      transferLocationUuid !== "" &&
      form.values.relatedLocation !== transferLocationUuid
    ) {
      form.values.relatedLocation = transferLocationUuid;
    }
  }, [
    editing,
    form.values,
    getEditing,
    getLastTransfer,
    getOperationType,
    getRelatedTransferIn,
    mode,
    navigate,
    operation,
    transferLocationUuid,
    transferTypeUuid,
  ]);

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
            <Info label={"Date du transfert"} value={operation.operationDate} />

            <Info
              label={"Struture de transfert"}
              value={operation.exchangeLocation.name}
            />
            <Info
              label={"Numéro de transfert"}
              value={operation.operationNumber}
            />
            <Info
              label={"Type de transfert"}
              value={
                operation.operationType.uuid.includes("TRANSFEROUT")
                  ? "SORTANT"
                  : "ENTRANT"
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

              <RadioGroup
                label="Type de transfert"
                size={"sm"}
                required
                {...form.getInputProps("transferType")}
                pb={"md"}
                onChange={setTransferTypeUuid}
                value={transferTypeUuid}
              >
                <Radio
                  value={"TRANSFEROUTOOOOOOOOOOOOOOOOOOOOOOOOOOO"}
                  label={"SORTANT"}
                  pt={"5"}
                />
                <Radio
                  value={"TRANSFERINOOOOOOOOOOOOOOOOOOOOOOOOOOOO"}
                  label={"ENTRANT"}
                />
              </RadioGroup>

              <DatePicker
                placeholder="Date de la réception"
                inputFormat="DD/MM/YYYY"
                locale="fr"
                label="Date de transfert"
                required
                style={{ width: 160 }}
                {...form.getInputProps("operationDate")}
                maxDate={dayjs(new Date()).toDate()}
                minDate={
                  latestTransfer
                    ? dayjs(latestTransfer?.operationDate).toDate()
                    : latestInventory
                    ? dayjs(latestInventory.operationDate).toDate()
                    : dayjs(new Date()).add(-3, "year").toDate()
                }
                icon={<FontAwesomeIcon icon={faCalendar} />}
              />

              <TextInput
                label="Numero de transfert"
                style={{ width: 160 }}
                required
                placeholder="Bordereau de livraison"
                {...form.getInputProps("operationNumber")}
              />

              <Select
                searchable={true}
                style={{ width: "20%" }}
                clearable={true}
                data={directClients}
                label={"Site de transfer"}
                {...form.getInputProps("relatedLocation")}
                onChange={setTransferLocationUuid}
                value={transferLocationUuid}
              />

              {transferTypeUuid.includes("OUT") && (
                <Select
                  searchable={true}
                  style={{ width: "20%" }}
                  clearable={true}
                  data={transferReasonList}
                  label={"Raison du transfert"}
                  {...form.getInputProps("observation")}
                />
              )}

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
