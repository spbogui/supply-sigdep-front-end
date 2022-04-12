import { useQuery } from "react-query";
import OperationService from "../services/OperationService";

export const useFindStock = (
  params: string = "v=full",
  enabled: boolean = true
) => {
  const { data, refetch: getLStocks } = useQuery(
    ["stocks", params],
    async () => await OperationService.getAllStock(params),
    { enabled }
  );

  const stocks = data ? data : [];
  return {
    stocks,
    getLStocks,
  };
};

export const useFindAvailableSocks = (
  program: string,
  currentStockAttributes: string[]
) => {
  const { stocks } = useFindStock(
    `filter=available&program=${program}&v=default`
  );

  const availableStock = stocks
    ? stocks.filter(
        (stock) =>
          !currentStockAttributes.some(
            (attribute) => attribute === stock.attribute.uuid
          )
      )
    : [];

  return { availableStock };
};
