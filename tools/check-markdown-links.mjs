import { execFile } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve } from 'node:path';
import { promisify } from 'node:util';

const EXIT_CHECK_FAILED = 1;
const EXIT_USAGE = 2;
const markdownLinkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
const execFileAsync = promisify(execFile);

function printUsage() {
  console.log(`Check relative file targets in all repository Markdown files.

Usage:
  node tools/check-markdown-links.mjs
  node tools/check-markdown-links.mjs --help

Requirement:
  run from the repository root with Git available in PATH

Exit codes:
  0  all relative file targets resolve
  1  at least one relative file target is broken or unreadable
  2  unsupported arguments`);
}

async function findMarkdownFiles(directory) {
  const { stdout } = await execFileAsync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    { cwd: directory, encoding: 'utf8' },
  );

  return String(stdout)
    .split('\0')
    .filter((path) => extname(path).toLowerCase() === '.md')
    .map((path) => resolve(directory, path));
}

function getRelativeTargets(markdown) {
  const withoutCodeFences = markdown.replace(/```[\s\S]*?```/g, '');
  return [...withoutCodeFences.matchAll(markdownLinkPattern)]
    .map((match) => match[1].trim().split(/\s+/u)[0])
    .filter(
      (target) =>
        target.length > 0 && !target.startsWith('#') && !/^[a-z][a-z\d+.-]*:/iu.test(target),
    );
}

function resolveTarget(markdownFile, rawTarget) {
  const targetWithoutTitle = rawTarget.replace(/^<|>$/g, '');
  const path = targetWithoutTitle.split(/[?#]/u)[0];
  return resolve(dirname(markdownFile), decodeURIComponent(path));
}

async function main() {
  const arguments_ = process.argv.slice(2);
  if (arguments_.includes('--help') || arguments_.includes('-h')) {
    printUsage();
    return 0;
  }
  if (arguments_.length > 0) {
    printUsage();
    return EXIT_USAGE;
  }

  const repositoryRoot = process.cwd();
  let markdownFiles;
  try {
    markdownFiles = await findMarkdownFiles(repositoryRoot);
  } catch (error) {
    console.error(`Cannot discover repository Markdown files (${error.code ?? 'unreadable'}).`);
    return EXIT_CHECK_FAILED;
  }
  const failures = [];

  for (const markdownFile of markdownFiles) {
    const markdown = await readFile(markdownFile, 'utf8');
    for (const target of getRelativeTargets(markdown)) {
      try {
        await access(resolveTarget(markdownFile, target));
      } catch (error) {
        failures.push(
          `${relative(repositoryRoot, markdownFile)}: ${target} (${error.code ?? 'unreadable'})`,
        );
      }
    }
  }

  if (failures.length > 0) {
    console.error(`Broken relative Markdown file targets:\n${failures.join('\n')}`);
    return EXIT_CHECK_FAILED;
  }

  console.log(`Markdown file targets: OK (${markdownFiles.length} files).`);
  return 0;
}

process.exitCode = await main();
