import { SelectItem } from "@mantine/core";
import { useMutation, useQuery } from "react-query";
import { LocationAttribute } from "../models/shared";
import LocationQuery from "../services/LocationQuery";
import { Fn } from "../utils/Fn";

export const useFindLocations = (
  params: string = "v=default",
  enabled: boolean = true
) => {
  const {
    data,
    refetch: getLocations,
    isLoading,
  } = useQuery(
    ["locations", params],
    async () => await LocationQuery.getAll(params),
    { enabled }
  );

  const locations = data ? data : [];
  const locationSelectList: SelectItem[] = data
    ? data.map((l) => {
        return { label: l.name, value: l.uuid };
      })
    : [];
  return {
    locations,
    locationSelectList,
    getLocations,
    isLoading,
  };
};

export const useFindLocation = (
  uuid: string,
  enabled: boolean = false,
  params: string = "v=default"
) => {
  const { data, refetch: getLocation } = useQuery(
    ["locations", "one", uuid, params],
    async () => await LocationQuery.getOne(uuid, params),
    { enabled }
  );

  const { attributes, code, directClientAttribute, programAttribute } =
    useFindLocationAttributes(data ? data.uuid : "", "", data ? true : false);
  const locationAttributes = attributes.filter(
    (attribute: LocationAttribute) => !attribute.voided
  );

  const location = data ? data : undefined;
  return {
    location,
    locationAttributes,
    getLocation,
    code,
    directClientAttribute,
    programAttribute,
  };
};

export const useFindLocationProviders = (
  enabled: boolean = false,
  params: string = "v=default"
) => {
  const { data, refetch: getLocation } = useQuery(
    ["locations", "provider", params],
    async () => await LocationQuery.getProviders(params),
    { enabled }
  );

  const location = data ? data : undefined;
  return {
    location,
    getLocation,
  };
};

export const useFindLocationAttributes = (
  uuid: string,
  params: string = "",
  enabled: boolean = false
) => {
  const { data, refetch: getLocationAttributes } = useQuery(
    ["locations", "attributes", uuid, params],
    async () => await LocationQuery.getAttributes(uuid, params),
    { enabled }
  );

  const attributes = data ? data : [];
  const { directClientAttribute, programAttribute, code } =
    Fn.extractLocationAttributes(attributes);

  return {
    attributes,
    getLocationAttributes,
    directClientAttribute,
    programAttribute,
    code,
  };
};

export const useFindDirectClients = (currentLocation: string) => {
  const { locations } = useFindLocations("filter=client&v=default");
  const directClients: SelectItem[] = locations
    .map((l) => {
      return { value: l.uuid, label: l.name };
    })
    .filter((l) => l.value !== currentLocation);

  return { directClients };
};

export const useLocationAttributeMutation = (
  locationUuid: string,
  attributeUuid: string = ""
) => {
  const { mutate: saveLocationAttribute, isLoading } = useMutation(
    async (data: any) => {
      return await LocationQuery.saveAttribute(
        data,
        locationUuid,
        attributeUuid
      );
    }
  );

  return { saveLocationAttribute, isLoading };
};
