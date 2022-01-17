module.exports = {
	webpack: {
		configure: (webpackConfig) => {
			webpackConfig.resolve.extensions.push(".gsgl");

			const gsglLoader = {
				test: /\.glsl$/i,
				type: "asset/source"
			}

			webpackConfig.module.rules.push(gsglLoader);
			return webpackConfig;
		}
	}
}
