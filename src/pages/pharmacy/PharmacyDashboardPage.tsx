import React from "react";
import { useUserContext } from "../../hooks/context";

const PharmacyDashboardPage = () => {
  const { userLocation } = useUserContext();

  return <div>Supply Dashboard</div>;
};

export default PharmacyDashboardPage;
