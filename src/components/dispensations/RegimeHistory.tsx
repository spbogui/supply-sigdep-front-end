import {Card, CardSection, Divider, Grid, Text, useMantineTheme,} from "@mantine/core";
import dayjs from "dayjs";
import {Obs} from "../../models/shared";

type RegimeTableProps = {
    obs: Obs[];
};

type RegimeTableData = {
    regimeDate: Date;
    label: string;
    uuid: string;
};

type RegimeToFollow = {
    current: string;
    previous: string;
}

const RegimeTable = (props: RegimeTableProps) => {
    const {obs} = props;
    const theme = useMantineTheme();

    console.log(obs)

    const regimeToFollow: RegimeToFollow = {current: '', previous: ''}
    const regimeTableData: RegimeTableData[] =
        obs.sort((a, b) => dayjs(a.obsDatetime).isAfter(b.obsDatetime) ? 1 : -1)
            .reduce(
                (acc: RegimeTableData[], d) => {
                    const regime = (d.display.split(':')[1]).trim();
                    // console.log(obsDisplay)
                    // const regime = obsDisplay.length > 1 ? (obsDisplay : null;

                    if (regime.length !== 0) {
                        regimeToFollow.previous = regimeToFollow.current;
                        regimeToFollow.current = regime;

                        if (acc.length === 0 || (regimeToFollow.current !== regimeToFollow.previous)) {
                            console.log("inserted", regime, d.obsDatetime)
                            acc.push({
                                regimeDate: d.obsDatetime,
                                label: regime,
                                uuid: d.uuid
                            });
                        }
                    }
                    return acc;
                },
                []
            );
    return (
        <Card style={{width: '100%'}} p={"xs"}>
            <Text color={"blue"} size={"sm"} weight={"bold"} transform={"uppercase"} mb={"sm"}>
                Historique des changements de Régime
            </Text>
            <Grid columns={5}>
                {regimeTableData.map((d, i) => (
                    <Grid.Col span={1} key={d.uuid}>
                        <Card
                            style={{
                                border: 1,
                                borderStyle: "solid",
                                borderColor: theme.colors.green[4],
                                backgroundColor: theme.colors.gray[1],
                            }}
                            shadow={"xs"}
                        >
                            <Text color={"blue"} weight={"bold"} size={"lg"}>
                                {d.label}
                            </Text>
                            <Text color={"gray"} size={"sm"} weight={"bold"}>
                                {dayjs(d.regimeDate).format("DD/MM/YYYY")}
                            </Text>
                        </Card>

                    </Grid.Col>
                ))}
            </Grid>


            <CardSection>
                <Divider my={"xs"} color={"blue"}/>
            </CardSection>
        </Card>
    );
};

export default RegimeTable;
