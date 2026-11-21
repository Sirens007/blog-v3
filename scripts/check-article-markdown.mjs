import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import remarkMath from 'remark-math'

// Resolve the parser through Nuxt Content so this also works with pnpm's strict layout.
const contentRequire = createRequire(import.meta.resolve('@nuxt/content'))
const mdcEntry = contentRequire.resolve('@nuxtjs/mdc')
const mdcRequire = createRequire(mdcEntry)
const { createMarkdownParser, createParseProcessor } = await import(pathToFileURL(join(dirname(mdcEntry), 'runtime/index.js')).href)
const parserOptions = {
	contentHeading: false,
	highlight: false,
	remark: { plugins: { 'remark-math': { instance: remarkMath } } },
}
const parseMarkdown = await createMarkdownParser(parserOptions)
const syntaxParser = await createParseProcessor(parserOptions)

const args = process.argv.slice(2)
const generated = args.includes('--generated')
const files = args.filter(arg => arg !== '--generated' && arg !== '--')
const skippedTags = new Set(['pre', 'code', 'kbd', 'samp', 'script', 'style', 'svg', 'math'])
const markers = /\*\*|__|~~|`|!?\[[^\]\n]+\]\([^\n)]*\)/

if (!files.length) {
	console.error('用法：pnpm check:article [--generated] content/posts/2026/文章目录/index.md')
	process.exit(1)
}

function unparsedText(node, issues, skipped = false) {
	const tag = node.tag || node.tagName
	if (skipped || skippedTags.has(tag))
		return
	if ((node.type === 'text' || node.nodeName === '#text') && markers.test(node.value))
		issues.add(node.value.trim())
	for (const child of node.children || node.childNodes || [])
		unparsedText(child, issues)
}

function openFence(source) {
	let opening
	for (const [index, line] of source.split(/\r?\n/).entries()) {
		const content = line.replace(/^(?: {0,3}> ?)+/, '')
		const match = content.match(/^\s*(`{3,}|~{3,})/)
		if (!match)
			continue
		if (!opening) {
			opening = { marker: match[1][0], length: match[1].length, line: index + 1 }
		}
		else if (match[1][0] === opening.marker && match[1].length >= opening.length && !content.slice(match[0].length).trim()) {
			opening = undefined
		}
	}
	return opening
}

function singleTildeDeletion(node, source, issues) {
	if (node.type === 'delete') {
		const raw = source.slice(node.position.start.offset, node.position.end.offset)
		if (!raw.startsWith('~~'))
			issues.add(raw)
	}
	for (const child of node.children || [])
		singleTildeDeletion(child, source, issues)
}

function findArticle(node) {
	if (node.tagName === 'article' && node.attrs?.some(attr => attr.name === 'class' && attr.value.split(/\s+/).includes('article')))
		return node
	for (const child of node.childNodes || []) {
		const found = findArticle(child)
		if (found)
			return found
	}
}

function countDeletion(node) {
	return Number((node.tag || node.tagName) === 'del')
		+ (node.children || node.childNodes || []).reduce((sum, child) => sum + countDeletion(child), 0)
}

let failed = false
for (const file of files) {
	try {
		const source = await readFile(file, 'utf8')
		const fence = openFence(source)
		if (fence)
			throw new Error(`第 ${fence.line} 行的代码块没有闭合`)
		const { body, data } = await parseMarkdown(source)
		const issues = new Set()
		singleTildeDeletion(syntaxParser.parse(source), source, issues)
		unparsedText(body, issues)
		if (generated) {
			const sourcePath = relative(resolve('content/posts'), resolve(file)).replaceAll('\\', '/')
			if (sourcePath.startsWith('../'))
				throw new Error('生成页面检查仅支持 content/posts 下的文章')
			const route = data.permalink || `/${sourcePath.replace(/\.md$/, '').replace(/\/index$/, '')}`
			const output = join('.output/public', decodeURI(route), 'index.html')
			const { parse } = await import(pathToFileURL(mdcRequire.resolve('parse5')).href)
			const article = findArticle(parse(await readFile(output, 'utf8')))
			if (!article)
				throw new Error(`生成页面没有找到正文：${output}`)
			if (countDeletion(article) !== countDeletion(body))
				throw new Error('生成页面的删除线与源文件解析结果不一致，请重新构建后检查')
			unparsedText(article, issues)
		}
		if (issues.size) {
			failed = true
			console.error(`${file}：发现 ${issues.size} 处 Markdown 解析问题（检查未解析标记或单个 ~ 形成的删除线）`)
			for (const text of issues) {
				const index = source.indexOf(text)
				const line = index < 0 ? '生成页面' : `第 ${source.slice(0, index).split('\n').length} 行`
				console.error(`  ${line}：${text.replaceAll('\n', ' ').slice(0, 180)}`)
			}
		}
		else {
			console.log(`${file}：Markdown 解析检查通过${generated ? '（含生成页面）' : ''}`)
		}
	}
	catch (error) {
		failed = true
		console.error(`${file}：${error.message}`)
	}
}

if (failed)
	process.exitCode = 1
