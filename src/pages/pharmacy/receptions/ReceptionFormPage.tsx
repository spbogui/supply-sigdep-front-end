import { faWarehouse } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "dayjs/locale/fr";
import { Card, Group, Text } from "@mantine/core";
import { useParams } from "react-router-dom";
import HeaderForm from "../../../components/receptions/ReceptionHeaderForm";
import ReceptionFluxForm from "../../../components/receptions/ReceptionFluxForm";
import { useFindOperation } from "../../../hooks/operation";
import { useState } from "react";
import ReceptionReturnFluxForm from "../../../components/receptions/ReceptionReturnFluxForm";

const ReceptionFormPage = () => {
  const { receptionId } = useParams();

  const { operation: reception } = useFindOperation(
    receptionId ? receptionId : "",
    "reception"
  );

  return (
    <Card>
      {reception && (
        <>
          <Group position={"apart"}>
            <Group>
              <FontAwesomeIcon icon={faWarehouse} size="2x" color="green" />
              <Text size="xl" color={"green"}>
                Saisie Réception
              </Text>
            </Group>
          </Group>
          <HeaderForm
            program={reception.productProgram.uuid}
            mode={"view"}
            isEditable={false}
            operation={reception}
          />
          {reception.operationType.uuid.includes("RETURN") ? (
            <ReceptionReturnFluxForm
              receptionUuid={reception.uuid}
              program={reception.productProgram.uuid}
            />
          ) : (
            <ReceptionFluxForm
              receptionUuid={reception.uuid}
              program={reception.productProgram.uuid}
            />
          )}
        </>
      )}
    </Card>
  );
};

export default ReceptionFormPage;
