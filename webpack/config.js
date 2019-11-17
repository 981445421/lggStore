const path = require('path');

module.exports = {
    entry: './entry.js',
    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: 'index.js',
        // libraryTarget: 'commonjs2'
        // library: 'lggStore',
        libraryTarget: 'umd',
        // libraryExport: 'default'
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env',
                            [
                                "@babel/preset-react"
                            ]
                        ],
                        plugins: [
                            ["@babel/plugin-proposal-class-properties", {"loose": true}]
                        ]
                    }
                }
            }
        ]
    }
};