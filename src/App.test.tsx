import { render, screen } from "@testing-library/react";
import React from "react";
import App from "./App";

it("shows hello world", () => {
	render(<App />);
	expect(screen.getByText("Hello World!")).toBeInTheDocument();
});
