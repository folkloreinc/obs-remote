/* eslint-disable no-console, global-require */
/* eslint-disable import/no-extraneous-dependencies, import/no-dynamic-require, import/order */
module.exports = {
    /**
     * Webpack
     */
    webpack: {
        filename: () => 'js/main-[hash:8].js',
        chunkFilename: () => 'js/[name]-[hash:8].chunk.js',
        publicPath: '/',

        cssRegex: /\.global\.css$/,
        cssModuleRegex: /\.css$/,
        sassRegex: /\.global\.(scss|sass)$/,
        sassModuleRegex: /\.(scss|sass)$/,

        cssFilename: () => 'css/[name]-[contenthash:8].css',
        cssChunkFilename: () => 'css/[name]-[contenthash:8].chunk.css',
        cssLocalIdent: '[name]-[local]',

        imageFilename: () => 'img/[name]-[hash:8].[ext]',
        imagePublicPath: '/',

        mediaFilename: () => 'medias/[name]-[hash:8].[ext]',
        mediaPublicPath: '/',

        fontFilename: () => 'fonts/[name]-[hash:8].[ext]',
    },

    /**
     * Webpack Dev Server
     */
    webpackDevServer: {

    },

    /**
     * PostCSS
     */
    postcss: {
        ident: 'postcss',
        plugins: [
            require('postcss-flexbugs-fixes'),
            require('postcss-preset-env')({
                autoprefixer: {
                    flexbox: 'no-2009',
                },
                stage: 3,
            }),
        ],
    },


};
