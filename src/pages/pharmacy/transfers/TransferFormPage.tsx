import { faWarehouse } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, Group, Text } from "@mantine/core";
import React from "react";
import { useParams } from "react-router-dom";
import TransferInFluxPage from "../../../components/transfers/TransferInFluxForm";
import HeaderForm from "../../../components/transfers/TransferHeaderForm";
import { useFindOperation } from "../../../hooks/operation";
import TransferOutFluxForm from "../../../components/transfers/TransferOutFluxForm";

const TransferFormPage = () => {
  const { transferId, type } = useParams();

  const { operation: transfer } = useFindOperation(
    transferId ? transferId : "",
    "transfer"
  );
  return (
    <Card>
      {transfer && (
        <>
          <Group position={"apart"}>
            <Group>
              <FontAwesomeIcon icon={faWarehouse} size="2x" color="green" />
              <Text size="xl" color={"green"}>
                Saisie de Transfert
              </Text>
            </Group>
          </Group>
          <HeaderForm
            program={transfer.productProgram.uuid}
            mode={"view"}
            isEditable={false}
            operation={transfer}
          />
          {type === "IN" ? (
            <TransferInFluxPage
              transferUuid={transfer.uuid}
              program={
                transfer.productProgram instanceof Object
                  ? transfer.productProgram.uuid
                  : transfer.productProgram
              }
            />
          ) : (
            <TransferOutFluxForm
              transferUuid={transfer.uuid}
              program={
                transfer.productProgram instanceof Object
                  ? transfer.productProgram.uuid
                  : transfer.productProgram
              }
            />
          )}
        </>
      )}
    </Card>
  );
};

export default TransferFormPage;
