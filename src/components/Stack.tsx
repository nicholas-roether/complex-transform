import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { BoxProps } from "@mui/system";
import React, { Children, PropsWithChildren } from "react";

interface StackProps {
	width: number | string;
	height: number | string;
}

const StackWrapper = styled.div`
	position: relative;
	top: 0;
	left: 0;
`;

// const StackElement = styled.div`
// 	position: absolute;
// 	top: 0;
// 	left: 0;
// 	width: 100%;
// 	height: 100%;
// `;

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
	return (
		<StackWrapper style={{ width, height }}>
			{Children.map(children, (child) =>
				React.isValidElement(child) && child?.type === StackElement ? (
					child
				) : (
					<StackElement top="0" left="0">
						{child}
					</StackElement>
				)
			)}
		</StackWrapper>
	);
};

export default Stack;

export { StackElement };
