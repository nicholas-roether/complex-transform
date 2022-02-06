import {
	Button,
	Card,
	CardContent,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Component, ErrorInfo, PropsWithChildren } from "react";

interface ErrorPropertyDisplayProps {
	property?: string;
	title: string;
	fallback: string;
}

const ErrorText = styled("code")(({ theme }) => {
	console.log(theme);
	return {
		color: theme.palette.error.main
	};
});

const ErrorPropertyDisplay = ({
	property,
	title,
	fallback
}: ErrorPropertyDisplayProps) => {
	if (!property) return <Typography gutterBottom>{fallback}</Typography>;
	return (
		<p>
			<Typography variant="subtitle1" gutterBottom>
				{title}
			</Typography>
			<Card variant="outlined" sx={{ overflowX: "auto" }}>
				<CardContent style={{ whiteSpace: "pre" }}>
					<ErrorText>{property}</ErrorText>
				</CardContent>
			</Card>
		</p>
	);
};

interface ErrorBoundaryState {
	showDialog: boolean;
	error: Error | null;
}

interface ErrorBoundaryProps {}

class ErrorBoundary extends Component<
	PropsWithChildren<ErrorBoundaryProps>,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { showDialog: false, error: null };
	}

	private handleClose() {
		this.setState({ showDialog: false });
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error(
			`${error.name}: ${error.message}\n${errorInfo.componentStack}\n${
				error.stack ?? ""
			}`
		);
	}

	public render() {
		const { error, showDialog } = this.state;
		return (
			<>
				{!error && this.props.children}
				<Dialog open={showDialog} scroll="paper" maxWidth="lg">
					<DialogTitle>
						{`An Error Occurred! (${error?.name ?? "Unknown"})`}
					</DialogTitle>
					<DialogContent dividers>
						<ErrorPropertyDisplay
							property={error?.message}
							title="Error Message:"
							fallback="No error message provided."
						/>
						<ErrorPropertyDisplay
							property={error?.stack}
							title="Stack Trace:"
							fallback="No stack trace provided."
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => this.handleClose()}>Close</Button>
					</DialogActions>
				</Dialog>
			</>
		);
	}

	public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { showDialog: true, error };
	}
}

export default ErrorBoundary;
