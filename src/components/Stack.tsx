import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { BoxProps } from "@mui/system";
import React, { PropsWithChildren } from "react";

interface StackProps {
	width: number | string;
	height: number | string;
}

const StackWrapper = styled.div`
	position: relative;
	top: 0;
	left: 0;
`;

interface StackElementProps extends BoxProps {}

const StackElement = ({
	children,
	...props
}: PropsWithChildren<StackElementProps>) => (
	<Box position="absolute" {...props}>
		{children}
	</Box>
);

const Stack = ({ width, height, children }: PropsWithChildren<StackProps>) => {
	return <StackWrapper style={{ width, height }}>{children}</StackWrapper>;
};

export default Stack;

export { StackElement };
