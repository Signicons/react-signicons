const { readdirSync, readFileSync, writeFile } = require('fs')
const { parseString } = require('xml2js-parser')
const { inspect } = require('util')
const prettyJs = require('pretty-js')
const { inputDir } = require('./config')
const pascalCase = require('pascalcase')

function parseIcons(input) {
	let files = readdirSync(input, 'utf8')
	files.map(f => {
		let filesData = readFileSync(`${input}/${f}`, 'utf8')
		parseString(filesData, { trim: true }, (err, result) => {
			if (err) throw err
			let title = f.split('.').slice(0,-1).join('.')
			let xmlns = result.svg.$.xmlns
			let viewBox = result.svg.$.viewBox
			let width = result.svg.$.width
			let height = result.svg.$.height
			let path = result.svg.path[0].$.d
			result = { title, xmlns, viewBox, width, height, path }
			let data = inspect(result, false, null)
			let template = createTemplate(data, title)
			let templateFilePath = `./src/icons/signicons/${title}`
			writeFile(`${templateFilePath}.ts`, template, 'utf8', err => {
				if (err) throw err
				console.log(`Finished writing file: ${title}.ts`)
			})
		})
	})
}

function createTemplate(data, name) {
	let nameWithPrefix = `sg${pascalCase(name)}`
	return (
		"import { SigniconsInterface } from " + "\"../\"" +
		"\n\n" +
		"export const " + nameWithPrefix + ": SigniconsInterface = " +
		prettyJs(data)
	)
}

function createExportFileTemplate(data) {
	return (
		"export interface SigniconsInterface " + "{" + "\n" +
			"\treadonly title?: string,\n" +
			"\treadonly xmlns: string,\n" +
			"\treadonly viewBox: string, \n" +
			"\treadonly width: string | number, \n" +
			"\treadonly height: string | number, \n" +
			"\treadonly path: string, \n"
		+ "}"
		+ "\n\n"
		+ data.map(d => d).join("\n")
	)
}

function createIconMapTemplate(data) {
	return (
		"{\n"
		+ "\t" + JSON.stringify('iconsMap') + ": [\n"
		+ data.map(d => "\t\t" + JSON.stringify(`sg${pascalCase(d)}`)).join(",\n")
		+ "\n\t]\n"
		+ "}"
	)
}

function writeExportsFile(input) {
	let files = readdirSync(input, 'utf8')
	let exportFilePaths = []
	let iconArrayRenderHelper = []
	let iconMap = []
	files.map(f => {
		let removeExtFilename = f.split('.').slice(0,-1).join('.')
		exportFilePaths.push(`export { sg${pascalCase(removeExtFilename)} } from './signicons/${removeExtFilename}'`)
		iconArrayRenderHelper.push(removeExtFilename)
		iconMap.push(removeExtFilename)
	})
	let exportFileTemplate = createExportFileTemplate(exportFilePaths)
	let exportFileTemplatePath = './src/icons/index.ts'
	let exportIconsMapTemplate = createIconMapTemplate(iconMap)
	let exportIconsMapFilePath = './src/icons/signicons-map.json'
	writeFile(exportIconsMapFilePath, exportIconsMapTemplate, err => {
		if (err) throw err
		console.log(`Finished writing file: ${exportIconsMapFilePath}`)
	})
	return writeFile(exportFileTemplatePath, exportFileTemplate, 'utf8', err => {
		if (err) throw err
		console.log(`Finished writing file: ${exportFileTemplatePath}`)
	})
}

function run(input) {
	parseIcons(input)
	writeExportsFile(input)
}

run(inputDir)