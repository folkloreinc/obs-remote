/* eslint-disable no-console, global-require */
/* eslint-disable import/no-extraneous-dependencies, import/no-dynamic-require, import/order */
const program = require('commander');

program
    .version('0.1.0')
    .option(
        '-c, --config [value]',
        'Webpack configuration',
        (val, configs) => (configs === null ? [val] : [...configs, val]),
        null,
    )
    .parse(process.argv);

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
    throw err;
});

// Ensure environment variables are read.
require('../env');

const path = require('path');
const chalk = require('chalk');
const glob = require('glob');
const fs = require('fs-extra');
const webpack = require('webpack');
const defaultWebpackConfig = require('../webpack.config.prod');
const paths = require('../paths');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const printHostingInstructions = require('react-dev-utils/printHostingInstructions');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const printBuildError = require('react-dev-utils/printBuildError');

const { measureFileSizesBeforeBuild, printFileSizesAfterBuild } = FileSizeReporter;
const useYarn = fs.existsSync(paths.yarnLockFile);

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

const webpackConfigs = program.config !== null
    ? program.config.map(configPath => require(path.join(process.env.PWD, configPath)))
    : [defaultWebpackConfig];

// Warn and crash if required files are missing
const entries = webpackConfigs.reduce(
    (allEntries, webpackConfig) => [...allEntries, ...webpackConfig.entry],
    [],
);
if (!checkRequiredFiles(entries)) {
    process.exit(1);
}

// Create the production build and print the deployment instructions.
function build(webpackConfig, previousFileSizes) {
    console.log('Creating an optimized production build...');
    const compiler = webpack(webpackConfig);
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                return reject(err);
            }
            const messages = formatWebpackMessages(stats.toJson({}, true));
            if (messages.errors.length) {
                // Only keep the first error. Others are often indicative
                // of the same problem, but confuse the reader with noise.
                if (messages.errors.length > 1) {
                    messages.errors.length = 1;
                }
                return reject(new Error(messages.errors.join('\n\n')));
            }
            if (
                process.env.CI &&
                (typeof process.env.CI !== 'string' || process.env.CI.toLowerCase() !== 'false') &&
                messages.warnings.length
            ) {
                console.log(chalk.yellow('\nTreating warnings as errors because process.env.CI = true.\n' +
                            'Most CI servers set it automatically.\n'));
                return reject(new Error(messages.warnings.join('\n\n')));
            }
            return resolve({
                webpackConfig,
                buildPath: webpackConfig.output.path,
                stats,
                previousFileSizes,
                warnings: messages.warnings,
            });
        });
    });
}

// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
Promise.all(webpackConfigs.map(conf => measureFileSizesBeforeBuild(conf.output.path)))
    .then((previousSizes) => {
        // Merge with the public folder
        paths.emptyPaths.forEach((dir) => {
            glob.sync(dir).forEach((file) => {
                fs.removeSync(file);
            });
        });

        // prettier-ignore
        return webpackConfigs.reduce(
            (lastPromise, webpackConfig, index) => lastPromise.then(responses => (
                build(webpackConfig, previousSizes[index]).then(response => [
                    ...responses,
                    response,
                ])
            )),
            Promise.resolve([]),
        );
    })
    .then(
        (builds) => {
            builds.forEach(({
                webpackConfig, stats, buildPath, previousFileSizes, warnings,
            }) => {
                if (warnings.length) {
                    console.log(chalk.yellow('Compiled with warnings.\n'));
                    console.log(warnings.join('\n\n'));
                    console.log(`\nSearch for the ${chalk.underline(chalk.yellow('keywords'))} to learn more about each warning.`);
                    console.log(`To ignore, add ${chalk.cyan('// eslint-disable-next-line')} to the line before.\n`);
                } else {
                    console.log(chalk.green('Compiled successfully.\n'));
                }

                console.log('File sizes after gzip:\n');
                console.log(buildPath);
                printFileSizesAfterBuild(
                    stats,
                    previousFileSizes,
                    buildPath,
                    WARN_AFTER_BUNDLE_GZIP_SIZE,
                    WARN_AFTER_CHUNK_GZIP_SIZE,
                );

                const appPackage = require(paths.appPackageJson);
                const { publicUrl } = paths;
                const { publicPath } = webpackConfig.output;
                const buildFolder = path.relative(process.cwd(), buildPath);
                printHostingInstructions(appPackage, publicUrl, publicPath, buildFolder, useYarn);
            });
        },
        (err) => {
            console.log(chalk.red('Failed to compile.\n'));
            printBuildError(err);
            process.exit(1);
        },
    );
