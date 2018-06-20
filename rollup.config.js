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

export default [
  {
    input: `src/${libraryName}.ts`,
    output: {
      name: libraryName,
      file: `dist/${libraryName}.browser.js`,
      format: "iife",
      sourcemap: true
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
      }),
      sourceMaps(),
      production && terser()
    ]
  },
  {
    input: `src/${libraryName}.ts`,
    output: {
      name: libraryName,
      file: pkg.module,
      format: "cjs",
      sourcemap: true
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
        preferBuiltins: false,
      }),
      sourceMaps(),
      production && terser()
    ]
  },
]