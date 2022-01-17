/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ["<rootDir>/src/jest-setup.ts"],
	roots: ["<rootDir>/src"],
	transform: {
		"^.+\\.(ts|tsx)$": ["ts-jest"],
	}
};
