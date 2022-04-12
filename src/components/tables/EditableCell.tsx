import { Badge, Input, Text } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import React, { useEffect } from "react";

type EditableCellProps = {
  value: string;
  column?: any;
  updateData: (id: string, value: any, attribute?: string) => void;
  maxValue?: number;
  hasConstraints?: boolean;
  rightSectionInfo?: string;
};

export const EditableCell = (props: EditableCellProps) => {
  const {
    value: initialValue,
    column: { id, attribute },
    updateData,
    maxValue,
    hasConstraints,
    rightSectionInfo,
  } = props;
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useInputState(initialValue);
  const [error, setError] = React.useState("");

  // const onChange = (e: any) => {
  //   setValue(e.target.value);
  // };

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    if (
      value !== initialValue &&
      (!hasConstraints || (hasConstraints && error === ""))
    ) {
      updateData(id, value, attribute);
    }
  };

  // If the initialValue is changed external, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    setError("");
    if (value !== initialValue && hasConstraints) {
      if (value.length === 0) {
        setError("Quantité requise");
      } else if (parseInt(value) === 0) {
        setError("Quantité > 0");
      } else if (maxValue && parseInt(value) > maxValue) {
        setError("Max dépassé");
      }
    }
  }, [maxValue, setValue, value]);

  // console.log(maxValue, error);

  return (
    <>
      <Input
        value={value}
        onChange={setValue}
        onBlur={onBlur}
        rightSection={
          rightSectionInfo ? (
            <Badge color="blue" variant="filled" size="xl">
              {rightSectionInfo}
            </Badge>
          ) : undefined
        }
      />
      <Text color={"red"} size={"xs"}>
        {error}
      </Text>
    </>
  );
};
