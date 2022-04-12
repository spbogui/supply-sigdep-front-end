import {
  faTablets,
  faHospital,
  faCogs,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider, Group, Tabs, Text } from "@mantine/core";
import React from "react";
import LocationConfigurationPage from "./LocationConfigurationPage";
import ProductConfigurationPage from "./ProductConfigurationPage";

const ConfigurationPage = () => {
  return (
    <>
      {/* <Group py={"xs"} mt={"xs"}>
        <FontAwesomeIcon icon={faCogs} />
        <Text>PARAMETRAGE PHARMACIE</Text>
      </Group> */}
      {/* <Divider my={"xs"} /> */}
      <Tabs>
        <Tabs.Tab
          label="Gestion des produits"
          icon={<FontAwesomeIcon size={"2x"} icon={faTablets} />}
        >
          <ProductConfigurationPage />
        </Tabs.Tab>
        <Tabs.Tab
          label="Gestion du site / district"
          icon={<FontAwesomeIcon icon={faHospital} size={"2x"} />}
        >
          <LocationConfigurationPage />
        </Tabs.Tab>
        {/* <Tabs.Tab label="Settings" icon={<Settings size={14} />}>Settings tab content</Tabs.Tab> */}
      </Tabs>
    </>
  );
};

export default ConfigurationPage;
