import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import sourceMaps from "rollup-plugin-sourcemaps"
import typescript from "rollup-plugin-typescript2"
import json from "rollup-plugin-json"
import builtins from "rollup-plugin-node-builtins"
import globals from "rollup-plugin-node-globals"
import {terser} from "rollup-plugin-terser"

const pkg = require("./package.json")

const libraryName = "slip32"

const production = !process.env.ROLLUP_WATCH

export default {
    input: `src/${libraryName}.ts`,
    output: [
        {file: pkg.main, name: libraryName, format: "umd", sourcemap: true},
        {file: pkg.module, format: "es", sourcemap: true},
    ],
    // Indicate here external modules you don"t wanna include in your bundle (i.e.: "lodash")
    external: [],
    watch: {
        include: "src/**",
    },
    plugins: [
        json(),
        commonjs(),
        globals(),
        builtins(),
        typescript({
            useTsconfigDeclarationDir: true
        }),
        resolve({
            main: true,
            jsnext: true,
            browser: true,
            preferBuiltins: false,
        }), // tells Rollup how to find date-fns in node_modules
        sourceMaps(),
        production && terser()
    ],
}