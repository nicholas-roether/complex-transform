module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"]
	},
	plugins: [
		"prettier",
	],
	extends: [
		"react-app",
		"react-app/jest",
		"plugin:prettier/recommended"
	]
}
