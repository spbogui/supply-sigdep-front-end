import { Container, useMantineTheme } from "@mantine/core";
import { Outlet } from "react-router-dom";
import SupplyHeader from "../../components/SupplyHeader";

const PharmacyHomePage = () => {
  const theme = useMantineTheme();

  return (
    <div>
      <SupplyHeader />
      <Container
        fluid
        style={{
          backgroundColor: theme.colors.gray[0],
          paddingTop: 5,
          minHeight: "60vh",
        }}
      >
        <Outlet />
      </Container>
    </div>
  );
};

export default PharmacyHomePage;
