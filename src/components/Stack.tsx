import styled from "@emotion/styled";
import React, { Children, PropsWithChildren } from "react";

interface StackProps {
	width: number | string;
	height: number | string;
}

const Stack = ({ width, height, children }: PropsWithChildren<StackProps>) => {
	const StackWrapper = styled.div`
		position: relative;
		top: 0;
		left: 0;
	`;

	const StackElement = styled.div`
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	`;

	return (
		<StackWrapper style={{ width, height }}>
			{Children.map(children, (child) => (
				<StackElement>{child}</StackElement>
			))}
		</StackWrapper>
	);
};

export default Stack;
