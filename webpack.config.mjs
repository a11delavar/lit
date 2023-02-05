import path from 'path'
import TerserPlugin from 'terser-webpack-plugin'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import ResolveTypeScriptPlugin from 'resolve-typescript-plugin'

export default {
	mode: 'production',
	entry: './src/index.ts',
	output: {
		path: path.resolve('dist'),
		filename: 'bundle.js',
		library: {
			name: 'Lit',
			type: 'global'
		}
	},
	resolve: {
		extensions: ['.ts', '.js'],
		plugins: [
			new ResolveTypeScriptPlugin(),
			new TsconfigPathsPlugin({ configFile: './tsconfig.json' })
		]
	},
	module: {
		rules: [
			{
				test: /(?<!\.test)\.ts$/,
				loader: 'ts-loader',
			}
		]
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					output: {
						comments: false,
					},
				},
				extractComments: false,
			})
		],
	}
}