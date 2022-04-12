import { createContext } from "react";
import "./styles/main.css";
import { NavLink, Route, Routes, HashRouter } from "react-router-dom";
import {
  AppShell,
  Header,
  Menu,
  Text,
  Divider,
  Group,
  Loader,
  Center,
  Alert,
  Title,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faHome,
  faPrescriptionBottle,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import DashboardPage from "./pages/DashboardPage";
import PharmacyHomePage from "./pages/pharmacy/PharmacyHomePage";
import PharmacyDashboardPage from "./pages/pharmacy/PharmacyDashboardPage";
import InventoryPage from "./pages/pharmacy/inventories/InventoryPage";
import { useQuery } from "react-query";
import SessionQuery from "./services/sessionQuery";
import InventoryFormPage from "./pages/pharmacy/inventories/InventoryFormPage";
import ReceptionPage from "./pages/pharmacy/receptions/ReceptionPage";
import ReceptionFormPage from "./pages/pharmacy/receptions/ReceptionFormPage";
import TransferPage from "./pages/pharmacy/transfers/TransferPage";
import TransferFormPage from "./pages/pharmacy/transfers/TransferFormPage";
import DispensationPage from "./pages/pharmacy/dispensations/DispensationPage";
import DispensationFormPage from "./pages/pharmacy/dispensations/DispensationFormPage";
import ConfigurationPage from "./pages/pharmacy/configurations/ConfigurationPage";

export const UserContext = createContext<any>({});

const App = () => {
  const { data, isLoading } = useQuery(
    ["session"],
    async () => {
      return await SessionQuery.authenticate();
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  const userInfo = data ? data : {};
  console.log(data);

  return (
    <>
      {isLoading ? (
        <Center style={{ width: "100%", height: "80vh" }}>
          <Loader size={"xl"} />
        </Center>
      ) : (
        <UserContext.Provider value={userInfo}>
          <HashRouter>
            <AppShell
              style={{ padding: 0, margin: 0 }}
              padding={"xs"}
              header={
                <Header
                  height={50}
                  // p={"xs"}
                  fixed={true}
                  sx={(theme) => ({
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? theme.colors.blue[9]
                        : theme.colors.green[9],
                    position: "fixed",
                    zIndex: 100000,
                  })}
                >
                  <div>
                    <Group position={"apart"}>
                      <Text
                        size={"xl"}
                        mt={0}
                        style={{ color: "white", fontFamily: "Roboto" }}
                      >
                        SIGDEP v3
                      </Text>
                      <Menu trigger="hover" delay={500}>
                        {/* <Menu.Label>Pharmacie</Menu.Label> */}
                        <Menu.Item
                          icon={<FontAwesomeIcon icon={faHome} color="green" />}
                        >
                          <NavLink
                            to={"/"}
                            style={{ textDecoration: "none", color: "black" }}
                          >
                            Accueil
                          </NavLink>
                        </Menu.Item>
                        <Menu.Item
                          icon={
                            <FontAwesomeIcon
                              icon={faPrescriptionBottle}
                              color="green"
                            />
                          }
                        >
                          <NavLink
                            to={"/supply"}
                            style={{ textDecoration: "none", color: "black" }}
                          >
                            Pharmacie
                          </NavLink>
                        </Menu.Item>
                        <Divider />
                        <Menu.Item
                          icon={<FontAwesomeIcon icon={faUser} color="green" />}
                        >
                          Mon Profile
                        </Menu.Item>
                        ,
                        <Menu.Item
                          color="red"
                          icon={<FontAwesomeIcon icon={faBan} color="red" />}
                        >
                          Deconnexion
                        </Menu.Item>
                      </Menu>
                    </Group>
                  </div>
                </Header>
              }
            >
              <div style={{ marginTop: 50 }}>
                {data && data.sessionLocation === null && (
                  <Alert color={"red"} variant={"filled"}>
                    <Center>
                      <Title order={3}>
                        Demandez à votre administrateur de bien vouloir
                        configurer votre Site par défaut !
                      </Title>
                    </Center>
                  </Alert>
                )}
                <Routes>
                  <Route path="/" element={<DashboardPage />}></Route>
                  <Route path="/supply" element={<PharmacyHomePage />}>
                    <Route path="" element={<PharmacyDashboardPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route
                      path="inventory/:inventoryId"
                      element={<InventoryFormPage />}
                    />
                    <Route path="reception" element={<ReceptionPage />} />
                    <Route
                      path="reception/:receptionId"
                      element={<ReceptionFormPage />}
                    />
                    <Route path="transfer" element={<TransferPage />} />
                    <Route
                      path="transfer/:transferId/:type"
                      element={<TransferFormPage />}
                    />
                    <Route path="dispensation" element={<DispensationPage />} />
                    <Route
                      path="dispensation/edit/:identifier/:type/:dispensationId"
                      element={<DispensationFormPage />}
                    />
                    <Route
                      path="dispensation/view/:identifier/:type"
                      element={<DispensationFormPage />}
                    />
                    <Route path="parameter" element={<ConfigurationPage />} />
                  </Route>
                  <Route path="*" element={<DashboardPage />}></Route>
                </Routes>
              </div>
            </AppShell>
          </HashRouter>
        </UserContext.Provider>
      )}
    </>
  );
};

export default App;
