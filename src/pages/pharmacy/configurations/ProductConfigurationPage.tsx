import {faCheckCircle, faList, faPlus, faSearch} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    Alert,
    Badge,
    Button,
    Card,
    Center,
    Divider,
    Grid,
    Group,
    List,
    Loader,
    ScrollArea,
    Select,
    SelectItem,
    Text,
    TextInput,
    ThemeIcon,
    useMantineTheme,
} from "@mantine/core";
import {useInputState} from "@mantine/hooks";
import {useEffect, useState} from "react";
import readXlsxFile from "read-excel-file";
import {useUserContext} from "../../../hooks/context";
import {
    useFindAllProducts,
    useFindProduct,
    useFindPrograms,
    useFindUnits,
    useGetRegimes,
    useProductMutation,
} from "../../../hooks/product";
import {ProductProgram, ProductRegime, ProductSave, ProductUnit} from "../../../models/Product";

type ProductProgramUpdate = {
    program: string;
    product: string;
}

type ProductRegimeUpdate = {
    regime: string;
    product: string;
}

const ProductConfigurationPage = () => {
    // const [count, setCount] = useState<number>(0);
    // const [countUpdate, setCountUpdate] = useState<number>(0);
    // const [countAdd, setCountAdd] = useState<number>(0);
    const [newProducts, setNewProducts] = useState<ProductSave[]>([]);
    const [oldProducts, setOldProducts] = useState<ProductSave[]>([]);
    const [newPrograms, setNewPrograms] = useState<ProductProgram[]>([]);
    const [newUnits, setNewUnits] = useState<ProductUnit[]>([]);
    const [updatedProductPrograms, setUpdateProductPrograms] = useState<ProductProgramUpdate[]>([]);
    const [updatedProductRegimes, setUpdateProductRegimes] = useState<ProductRegimeUpdate[]>([]);
    const [total, setTotal] = useState<number>(1);

    const [loading, setLoading] = useState<boolean>(false);
    const [selectedProduct, setSelectProduct] = useInputState<string>("");

    const theme = useMantineTheme();
    const {userLocation} = useUserContext();
    const [regimes, setRegimes] = useState<ProductRegime[]>([]);
    const [regimeFilterName, setRegimeFilterName] = useInputState<string>("");

    const {productRegimes} = useGetRegimes();

    const {product, getProduct} = useFindProduct(selectedProduct);

    const {programs, getPrograms} = useFindPrograms();

    const {units, getUnits} = useFindUnits();

    // console.log(units);

    //   const regimes: { uuid: string; name: string } = productRegime
    //     ? productRegime.map((r: ProductRegime) => {
    //         return { uuid: r.uuid, name: r.concept.name as string };
    //       })
    //     : [];

    //   console.log(productRegime);

    const {
        products: productsFound,
        getProducts,
        isLoading,
    } = useFindAllProducts();
    const existingCodes: string[] = productsFound
        ? productsFound.map((p) => p.code)
        : [];

    const productSelectList: SelectItem[] = productsFound
        ? productsFound.map((p) => {
            return {value: p.uuid, label: p.code + " - " + p.dispensationName};
        })
        : [];

    const {
        createProduct,
        createProgram,
        createUnit,
        updateProduct
    } = useProductMutation();

    const onChange = (e: any) => {
        if (newProducts.length === 0) {
            readXlsxFile(e.target.files[0]).then((rows) => {
                const productsToSave: ProductSave[] = [];
                const productsToUpdate: ProductSave[] = [];
                const programsToSave: ProductProgram[] = [];
                const unitsToSave: ProductUnit[] = [];
                // ['#Code', '#Designation', '#Designation de dispensation', '#Unite de conditionnement', '#Nombre unite', '#Unite de dispensation', '#Prix de vente', '#Programme']
                rows.forEach((row) => {
                    if (row[0] !== "#Code") {

                        const rowCode = row[0].toString();
                        const rowPackageName = row[1].toString();
                        const rowDispensationName = row[2].toString();
                        const rowPackageUnit = row[3].toString();
                        const rowConversionUnit = parseFloat(row[4].toString());
                        const rowDispensationUnit = row[5].toString();
                        const rowProgram = row[7].toString();
                        const rowRegime = row[8] ? row[8].toString() : null;
                        const rowPrice = parseFloat(row[6].toString());

                        const existingProgram = programs.find(p => p.name === rowProgram);
                        const programUuid = existingProgram ? existingProgram.uuid :
                            rowProgram.replaceAll("_", "").replaceAll(" ", "") +
                            "PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP".slice(
                                rowProgram.replaceAll("_", "").replaceAll(" ", "").length
                            );

                        if (!existingProgram && programsToSave.findIndex(p => p.uuid === programUuid) === -1) {
                            programsToSave.push({name: rowProgram, description: "", uuid: programUuid})
                        }

                        const existingPackageUnit = units.find(u => u.name === rowPackageUnit);

                        const packageUnitUuid = existingPackageUnit ? existingPackageUnit.uuid :
                            rowPackageUnit.replaceAll("/", "").replaceAll(" ", "") +
                            "UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU".slice(
                                rowPackageUnit.replaceAll("/", "").replaceAll(" ", "").length
                            );

                        if (!existingPackageUnit && unitsToSave.findIndex(u => u.uuid === packageUnitUuid) === -1) {
                            unitsToSave.push({name: rowPackageUnit, description: "", uuid: packageUnitUuid})
                        }

                        const existingDispensationUnit = units.find(u => u.name === rowDispensationUnit);
                        const dispensationUnitUuid = existingDispensationUnit ? existingDispensationUnit.uuid :
                            rowDispensationUnit.replaceAll("/", "").replaceAll(" ", "") +
                            "UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU".slice(
                                rowDispensationUnit.replaceAll("/", "").replaceAll(" ", "").length
                            );

                        if (!existingDispensationUnit && unitsToSave.findIndex(u => u.uuid === dispensationUnitUuid) === -1) {
                            unitsToSave.push({name: rowDispensationUnit, description: "", uuid: dispensationUnitUuid})
                        }
                        const regimes: string[] = [];

                        // const regimesData = row[8] ? row[8].toString() : null;
                        if (rowRegime) {
                            if (rowRegime === "*") {
                                regimes.push(...productRegimes.map((r) => r.uuid));
                            } else {
                                regimes.push(
                                    ...productRegimes.reduce(
                                        (acc: string[], r: ProductRegime) => {
                                            if (
                                                rowRegime
                                                    .split(",")
                                                    .includes(r.concept.display.replaceAll(" ", "/"))
                                            ) {
                                                acc.push(r.uuid);
                                            }
                                            return acc;
                                        },
                                        []
                                    )
                                );
                            }
                        }

                        const existingProduct = productsFound.length > 0 ? productsFound.find(p => p.code === rowCode) : undefined;

                        const idxSave = productsToSave.findIndex(
                            (p) => p.code === rowCode
                        );
                        const idxUpdate = productsToUpdate.findIndex(
                            (p) => p.code === rowCode
                        );

                        if (idxSave === -1 || (productsFound.length > 0 && idxUpdate === -1)) {
                            const product: ProductSave = {
                                code: rowCode,
                                conversionUnit: rowConversionUnit,
                                names: [
                                    {
                                        productNameType: "PACKAGING",
                                        unit: packageUnitUuid,
                                        name: rowPackageName,
                                        uuid:
                                            rowCode +
                                            "PACKKAGINGNNNNNNNNNNNNNNNNNNNNNNNNNNNN".slice(
                                                rowCode.length
                                            ),
                                    },
                                    {
                                        productNameType: "DISPENSATION",
                                        unit: dispensationUnitUuid,
                                        name: rowDispensationName,
                                        uuid:
                                            rowCode +
                                            "DISPENSATIONNNNNNNNNNNNNNNNNNNNNNNNNNN".slice(
                                                rowCode.length
                                            ),
                                    },
                                ],
                                regimes,
                                prices: [
                                    {
                                        program: programUuid,
                                        salePrice: rowPrice,
                                        active: true,
                                        location: userLocation.uuid,
                                    },
                                ],
                                programs: [programUuid],
                                uuid:
                                    rowCode +
                                    "PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP".slice(
                                        rowCode.length
                                    ),
                            };
                            if (existingProduct) {
                                productsToUpdate.push(product);
                            } else {
                                productsToSave.push(product);
                            }

                        } else {
                            if (existingProduct) {
                                const product = productsToUpdate.find(
                                    (p) => p.code === rowCode
                                );
                                if (product) {
                                    product.programs.push(programUuid);
                                    productsToUpdate.splice(idxUpdate, 1);
                                    productsToUpdate.push(product);
                                }
                            } else {
                                const product = productsToSave.find(
                                    (p) => p.code === rowCode
                                );
                                if (product) {
                                    product.programs.push(programUuid);
                                    productsToSave.splice(idxSave, 1);
                                    productsToSave.push(product);
                                }
                            }

                        }

                    }
                });
                console.log(productsToSave);
                setTotal(productsToSave.length);
                setNewProducts(productsToSave);
                setNewPrograms(programsToSave);
                setNewUnits(unitsToSave);
                setOldProducts(productsToUpdate);

                // console.log('newProducts', productsToSave)
                console.log('newUnits', unitsToSave)
                console.log('newPrograms', programsToSave)
            });
        }
    };

    // const columns = useMemo(() => PRODUCT_COLUMNS, []);

    useEffect(() => {
        // setCount(Math.floor(((countAdd + countUpdate) / total) * 100));
        if (selectedProduct !== "") {
            getProduct();
        }
        // if (regimes.length === 0) {
        //     setRegimes(productRegimes);
        // }

        if (regimeFilterName !== "") {
            const r = productRegimes.filter(r => r.concept.display.includes(regimeFilterName))
            setRegimes(r);
        }
        if (regimes.length === 0) {
            setRegimes(productRegimes);
        }

    }, [selectedProduct, getProduct, regimeFilterName]);
    // console.log(regimeFilterName)
    // const filterRegimes = (value: string) => {
    //     if (value !== "") {
    //         return productRegimes.filter(r => r.concept.display.includes(value));
    //     }
    //     return productRegimes;
    // }

    // useCallback(
    //     () => {
    //         if (regimeFilterName !== "") {
    //             const r = productRegimes.filter(r => r.concept.display.includes(regimeFilterName))
    //             setRegimes(r);
    //         }
    //         return setRegimes(productRegimes);
    //     },
    //     [productRegimes, regimeFilterName],
    // );

    const createOrUpdate = () => {
        if (productsFound.length !== 0) {
            oldProducts.forEach(p => {
                updateProduct(p, {
                    onSuccess: () => {
                        newProducts.forEach(prod => {
                            createProduct(prod, {
                                onSuccess: () => {
                                    setLoading(false);
                                    getProducts();
                                    getPrograms();
                                }
                            })
                        });
                    }
                })
            })
        } else {
            newProducts.forEach(prod => {
                createProduct(prod, {
                    onSuccess: () => {
                        setLoading(false);
                        getProducts();
                        getPrograms();
                    }
                })
            });
        }


    }

    const saveProducts = () => {
        setLoading(true);

        if (newPrograms.length > 0 && newUnits.length > 0) {
            newPrograms.forEach(pr => {
                createProgram(pr, {
                    onSuccess: () => {
                        newUnits.forEach(u => {
                            createUnit(u, {
                                onSuccess: () => {
                                    createOrUpdate();
                                }
                            })
                        })
                    }
                })
            })
        } else if (newPrograms.length === 0 && newUnits.length > 0) {
            newUnits.forEach(u => {
                createUnit(u, {
                    onSuccess: () => {
                        createOrUpdate();
                    }
                })
            })
        } else if (newPrograms.length > 0 && newUnits.length === 0) {
            newPrograms.forEach(pr => {
                createProgram(pr, {
                    onSuccess: () => {
                        createOrUpdate();
                    }
                })
            })
        } else {
            createOrUpdate();
        }


        //   newProducts.forEach((product) => {
        //       if (!existingCodes.includes(product.code)) {
        //           createProduct(product, {
        //               onSuccess: () => {
        //                   // setCountAdd((c) => c + 1);
        //                   setLoading(false);
        //                   getProducts();
        //               },
        //           });
        //       } /* else {
        //   updateProduct(
        //     { value: product, uuid: product.uuid },
        //     {
        //       onSuccess: () => {
        //         setCountUpdate((c) => c + 1);
        //       },
        //     }
        //   );
        // } */
        //   });
    };

    return (
        <Card
            style={{
                border: 1,
                borderStyle: "solid",
                borderColor: theme.colors.blue[1],
            }}
            mt={"xs"}
        >
            <Card.Section>
                <Group
                    m={"xs"}
                    position="apart"
                    style={{marginBottom: 5, marginTop: theme.spacing.sm}}
                >
                    <Group>
                        <FontAwesomeIcon
                            icon={faList}
                            size={"1x"}
                            color={theme.colors.blue[9]}
                        />
                        <Text color={"blue"} weight={"bold"} transform={"uppercase"}>
                            Getion des produits
                        </Text>
                    </Group>
                </Group>
            </Card.Section>
            <Card.Section>
                <Divider my={"xs"} color={theme.colors.blue[1]}/>
            </Card.Section>

            <Card
                style={{
                    border: 1,
                    borderStyle: "solid",
                    borderColor: theme.colors.blue[1],
                }}
            >
                <Group>
                    <input type="file" onChange={onChange}/>
                    {/* <Progress
            style={{ width: "50%", height: 30 }}
            value={count}
            label={count + "%"}
            size="xl"
          /> */}

                    <Button
                        // loading={count !== total && count !== 0}
                        onClick={saveProducts}
                        color={"green"}
                        disabled={newProducts.length === 0 || loading}
                    >
                        Importer produits
                    </Button>
                    {loading && <Loader size={"xl"}/>}
                </Group>
            </Card>
            <Card
                style={{
                    border: 1,
                    borderStyle: "solid",
                    borderColor: theme.colors.blue[1],
                }}
            >
                <Grid columns={10}>
                    <Grid.Col span={2}>
                        <Card
                            style={{
                                border: 1,
                                borderStyle: "solid",
                                borderColor: theme.colors.blue[1],
                            }}
                        >
                            <Group>
                                <FontAwesomeIcon
                                    icon={faList}
                                    size={"1x"}
                                    color={theme.colors.blue[9]}
                                />
                                <Text color={"blue"} weight={"bold"} transform={"uppercase"}>
                                    Liste des programmes
                                </Text>
                            </Group>

                            <Card.Section>
                                <Divider color={"blue"} size={"sm"} my={"sm"}/>
                            </Card.Section>
                            <ScrollArea style={{height: 300}}>
                                <List
                                    spacing="xs"
                                    size="sm"
                                    center
                                    icon={
                                        <ThemeIcon color="teal" size={24} radius="xl">
                                            <FontAwesomeIcon icon={faCheckCircle} size={"2x"}/>
                                        </ThemeIcon>
                                    }
                                >
                                    {programs && programs.map(p => <List.Item key={p.uuid}>{p.name}</List.Item>)}

                                </List>
                            </ScrollArea>

                            <Card.Section>
                                <Divider color={"blue"} size={"sm"} my={"sm"}/>
                            </Card.Section>
                            <Group direction={"row"}>
                                <TextInput placeholder={"Ajouter nouveau programme"} style={{width: '75%'}}/>
                                <Button><FontAwesomeIcon icon={faPlus}/></Button>
                            </Group>
                        </Card>


                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Card
                            style={{
                                border: 1,
                                borderStyle: "solid",
                                borderColor: theme.colors.blue[1],
                            }}
                        >
                            <Group position="apart">
                                <Group>
                                    <FontAwesomeIcon
                                        icon={faList}
                                        size={"1x"}
                                        color={theme.colors.blue[9]}
                                    />
                                    <Text color={"blue"} weight={"bold"} transform={"uppercase"}>
                                        Produits
                                    </Text>
                                </Group>
                                <Group>
                                    <Text size="sm" color={"gray"} weight="bold">
                                        Total
                                    </Text>
                                    <Badge size="lg" color={"green"}>
                                        {productsFound ? productsFound.length : "0"}
                                    </Badge>
                                </Group>
                            </Group>

                            <Card.Section>
                                <Divider color={"blue"} size={"sm"} my={"sm"}/>
                            </Card.Section>
                            <Card
                                style={{
                                    border: 1,
                                    borderStyle: "solid",
                                    borderColor: theme.colors.blue[1],
                                }}
                            >
                                <Group>
                                    {isLoading ? (
                                        <Center style={{height: "5vh"}}>
                                            <Loader/>
                                        </Center>
                                    ) : (
                                        <>
                                            {productsFound.length > 0 ? (
                                                <>
                                                    <Text>Sélectionner un produit dans la liste : </Text>
                                                    <Select
                                                        style={{width: "60%"}}
                                                        data={productSelectList}
                                                        searchable
                                                        clearable
                                                        value={selectedProduct}
                                                        onChange={setSelectProduct}
                                                    />

                                                    {product && (
                                                        <Card
                                                            style={{
                                                                border: 1,
                                                                borderStyle: "solid",
                                                                borderColor: theme.colors.green[1],
                                                            }}
                                                        >
                                                            <Group>
                                                                <Text size="lg">CODE :</Text>
                                                                <Text
                                                                    size="xl"
                                                                    color={theme.colors.green[9]}
                                                                    weight={"bold"}
                                                                >
                                                                    {product.code}
                                                                </Text>
                                                            </Group>
                                                            <Group>
                                                                <Text size="lg">Désignation :</Text>
                                                                <Text
                                                                    size="xl"
                                                                    color={theme.colors.green[9]}
                                                                    weight={"bold"}
                                                                >
                                                                    {product.packagingName}
                                                                </Text>
                                                            </Group>
                                                            <Group>
                                                                <Text size="lg">
                                                                    Désignation de dispensation :
                                                                </Text>
                                                                <Text
                                                                    size="xl"
                                                                    color={theme.colors.green[9]}
                                                                    weight={"bold"}
                                                                >
                                                                    {product.dispensationName}
                                                                </Text>
                                                            </Group>
                                                            <Group>
                                                                <Text size="lg">Unité de conversion :</Text>
                                                                <Text
                                                                    size="xl"
                                                                    color={theme.colors.green[9]}
                                                                    weight={"bold"}
                                                                >
                                                                    ({product.conversionUnit})
                                                                </Text>
                                                            </Group>
                                                            <Group>
                                                                <Text size="lg">Programmes associés :</Text>
                                                                <Text
                                                                    size="xl"
                                                                    color={theme.colors.green[9]}
                                                                    weight={"bold"}
                                                                >
                                                                    {product.programs?.map((p) => (
                                                                        <Badge size="xl" key={p.uuid}>
                                                                            {p.name}
                                                                        </Badge>
                                                                    ))}
                                                                </Text>
                                                            </Group>
                                                            <Group>
                                                                <Text size="lg">Régimes associés :</Text>
                                                                <Text
                                                                    size="xl"
                                                                    color={theme.colors.green[9]}
                                                                    weight={"bold"}
                                                                >
                                                                    {product.regimes?.map((p) => (
                                                                        <Badge size="xl" key={p.uuid}>
                                                                            {p.concept.display}
                                                                        </Badge>
                                                                    ))}
                                                                </Text>
                                                            </Group>
                                                        </Card>
                                                    )}
                                                </>
                                            ) : (
                                                <Alert color={"red"} mt={"xs"}>
                                                    <Center>
                                                        Vous n'avez aucun produit veuillez procéder à
                                                        l'importation SVP
                                                    </Center>
                                                </Alert>
                                            )}
                                        </>
                                    )}
                                </Group>
                            </Card>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={2}>
                        <Card
                            style={{
                                border: 1,
                                borderStyle: "solid",
                                borderColor: theme.colors.blue[1],
                            }}
                        >
                            <Group>
                                <FontAwesomeIcon
                                    icon={faList}
                                    size={"1x"}
                                    color={theme.colors.blue[9]}
                                />
                                <Text color={"blue"} weight={"bold"} transform={"uppercase"}>
                                    Liste des Régimes
                                </Text>
                            </Group>

                            <Card.Section>
                                <Divider color={"blue"} size={"sm"} my={"sm"}/>
                            </Card.Section>

                            <TextInput placeholder={"Rechercher "} rightSection={<FontAwesomeIcon icon={faSearch}/>}
                                       value={regimeFilterName}
                                       onChange={setRegimeFilterName}/>

                            <Card.Section>
                                <Divider color={"blue"} size={"sm"} my={"sm"}/>
                            </Card.Section>

                            <ScrollArea style={{height: 300}}>
                                <List
                                    spacing="xs"
                                    size="sm"
                                    center
                                    icon={
                                        <ThemeIcon color="teal" size={24} radius="xl">
                                            <FontAwesomeIcon icon={faCheckCircle} size={"2x"}/>
                                        </ThemeIcon>
                                    }
                                >
                                    {regimes && regimes.map(p =>
                                        <List.Item key={p.uuid}>{p.concept.display}</List.Item>)}

                                </List>
                            </ScrollArea>
                        </Card>
                    </Grid.Col>
                </Grid>
            </Card>
        </Card>
    );
};

export default ProductConfigurationPage;
