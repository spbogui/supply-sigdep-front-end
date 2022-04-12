import { faWarehouse } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "dayjs/locale/fr";
import { Card, Group, Text } from "@mantine/core";
import { useParams } from "react-router-dom";
import InventoryHeaderForm from "../../../components/inventories/InventoryHeaderForm";
import InventoryProductForm from "../../../components/inventories/InventoryFluxForm";
import { useFindOperation } from "../../../hooks/operation";

const InventoryFormPage = () => {
  const { inventoryId } = useParams();
  const { operation: inventory } = useFindOperation(
    inventoryId ? inventoryId : "",
    "inventory"
  );

  return (
    <Card>
      {inventory && (
        <>
          <Group position={"apart"}>
            <Group>
              <FontAwesomeIcon icon={faWarehouse} size="2x" color="green" />
              <Text size="xl" color={"green"}>
                Saisie Inventaire
              </Text>
            </Group>
          </Group>
          <InventoryHeaderForm
            handleIsSaved={() => console.log("saved")}
            handleIsSaving={() => console.log("is saving")}
            program={
              inventory.productProgram instanceof Object
                ? inventory.productProgram.uuid
                : inventory.productProgram
            }
            mode={"edit"}
            isEditable={false}
            inventory={inventory}
          />
          <InventoryProductForm
            inventoryUuid={inventory.uuid}
            program={
              inventory.productProgram instanceof Object
                ? inventory.productProgram.uuid
                : inventory.productProgram
            }
          />
        </>
      )}
    </Card>
  );
};

export default InventoryFormPage;
