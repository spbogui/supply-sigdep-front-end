import { useContext } from "react";
import { useQuery } from "react-query";
import { UserContext } from "../App";
import { Location } from "../models/shared";
import LocationQuery from "../services/LocationQuery";
import { LocationAttributeType } from "../utils/constants";
import { Fn } from "../utils/Fn";
import { useFindLocation, useFindLocationAttributes } from "./location";

type UserInfo = {
  sessionId: string;
  authenticated: boolean;
  user: {
    uuid: string;
    display: string;
    username: string;
    systemId: string;
    userProperties: {
      defaultLocale: string;
      loginAttempts: number;
      defaultLocation: string;
    };
    person: {
      uuid: string;
    };
    privileges: string[];
    roles: [
      {
        uuid: string;
        name: string;
      }
    ];
  };
  locale: string;
  allowedLocales: string[];
  sessionLocation: {
    uuid: string;
    display: string;
  };
};
export const useUserContext = () => {
  const userInfo: UserInfo = useContext(UserContext);

  const { location, locationAttributes } = useFindLocation(
    userInfo.sessionLocation?.uuid,
    true,
    "v=full"
  );

  // console.log(locationAttributes, "locationAttributes");

  const { directClientAttribute } =
    Fn.extractLocationAttributes(locationAttributes);
  const isDirectClient = directClientAttribute
    ? (directClientAttribute.value as boolean)
    : false;

  const userLocation = location ? location : undefined;

  // console.log(directClientAttribute, "directClientAttribute");

  const userParentLocation = userLocation
    ? userLocation.parentLocation
    : undefined;
  const childrenLocation = userLocation ? userLocation.children : [];
  const roles = userInfo.user.roles;

  const isSystemDeveloper = roles.some(
    (role) => role.name === "System Developer"
  );

  const relatedLocation = isDirectClient
    ? "NPSPLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL"
    : location
    ? location.uuid
    : "";

  const hasPrivileges = (privileges: string[]) => {
    return userInfo.user.privileges.some((privilege) =>
      privileges.includes(privilege)
    );
  };

  // const isDirectClient = relatedLocation?.startsWith("NPSP");

  // console.log(isDirectClient, "isDirectClient");
  // console.log(relatedLocation, "relatedLocation");

  return {
    userLocation,
    userParentLocation,
    childrenLocation,
    hasPrivileges,
    isSystemDeveloper,
    relatedLocation,
    isDirectClient,
  };
};

// const getRelatedLocation = (
//   userLocation: Location | undefined
// ): string | undefined => {
//   if (userLocation && userLocation.attributes) {
//     const attribute = (userLocation.attributes as any[]).find(
//       (attribute: any) =>
//         attribute.attributeType.uuid === LocationAttributeType.DIRECT_CLIENT &&
//         attribute.voided === false
//     );
//     if (attribute && attribute.value === true) {
//       return "NPSPLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL";
//     } else {
//       return userLocation.parentLocation
//         ? userLocation.parentLocation.uuid
//         : undefined;
//     }
//   }
//   return undefined;
// };
