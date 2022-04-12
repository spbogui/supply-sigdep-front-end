import { Text, Alert } from "@mantine/core";
import dayjs from "dayjs";

type InfoProps = {
  label: string;
  value: any;
  color?: string;
  textColor?: string;
};

const Info = (props: InfoProps) => {
  const { value, label, color, textColor } = props;
  return (
    <Alert title={label} color={color ? color : "light"} variant="filled">
      <Text size="lg" color={textColor ? textColor : "white"} weight={"bold"}>
        {/* {!(value instanceof Date) && <Text>{value}</Text>} */}
        {value
          ? dayjs(value).isValid() && !value.includes("INVC")
            ? dayjs(value).format("DD/MM/YYYY")
            : value
          : "N/R"}
      </Text>
    </Alert>
  );
};

export default Info;
