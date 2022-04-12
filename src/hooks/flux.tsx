import { useMutation, useQuery } from "react-query";
import { ProductOperationFluxSave } from "../models/ProductOperation";
import OperationService from "../services/OperationService";

export const useFindFlux = (
  uuid: string,
  operationUuid: string,
  operation: string
) => {
  const { data: flux, refetch: findFlux } = useQuery(
    [operation, operationUuid, "flux", uuid],
    async () => await OperationService.getOneFlux(operationUuid, uuid, ""),
    { enabled: false }
  );

  return { flux, findFlux };
};

export const useFindFluxAttribute = (uuid: string, fluxUuid: string) => {};

export const useFluxMutation = (operationUuid: string) => {
  const { mutate: addFlux } = useMutation(
    async (data: ProductOperationFluxSave) => {
      return await OperationService.createFlux(data, operationUuid);
    }
  );

  const { mutate: removeFlux } = useMutation(async (uuid: string) => {
    return await OperationService.removeFlux(operationUuid, uuid);
  });

  const { mutate: updateFluxQuantity } = useMutation(
    async (value: [number, string]) => {
      return await OperationService.updateFlux(
        { quantity: value[0] },
        operationUuid,
        value[1]
      );
    }
  );

  const { mutate: updateFluxRelatedQuantity } = useMutation(
    async (value: [number, string]) => {
      return await OperationService.updateFlux(
        { relatedQuantity: value[0] },
        operationUuid,
        value[1]
      );
    }
  );

  const { mutate: updateFluxObservation } = useMutation(
    async (value: string[]) => {
      return await OperationService.updateFlux(
        { observation: value[0] },
        operationUuid,
        value[1]
      );
    }
  );

  const { mutate: updateFlux } = useMutation(
    async (data: { flux: any; fluxUuid: string }) => {
      return await OperationService.updateFlux(
        data.flux,
        operationUuid,
        data.fluxUuid
      );
    }
  );

  const { mutate: updateFluxAttribute } = useMutation(
    async (data: { value: any; attributeUuid: string }) => {
      return await OperationService.updateFluxAttribute(
        data.value,
        data.attributeUuid
      );
    }
  );

  return {
    addFlux,
    removeFlux,
    updateFluxQuantity,
    updateFluxObservation,
    updateFlux,
    updateFluxAttribute,
    updateFluxRelatedQuantity,
  };
};
