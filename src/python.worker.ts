/// <reference lib="webworker" />

import type { loadPyodide as loadPyodideType, PyodideInterface } from "pyodide";
import type { IRunnerArgs, IRunnerCmd, IRunnerCmdResponse, IRunnerOutput } from "~/types/python.worker";

const state = {
	stdout: [] as string[],
	stderr: [] as string[],
	stdin: [] as string[],
	resetWithInput: (input: string[]) => {
		state.stdout = [];
		state.stderr = [];
		state.stdin = input;
	},
};

declare type PyoditeLoaderOptions = Parameters<typeof loadPyodideType>[0];
const pyoditeOptions: PyoditeLoaderOptions = {
	stdout: (d: string) => state.stdout.push(d),
	stderr: (d: string) => state.stderr.push(d),
	// @ts-ignore
	stdin: () => state.stdin.shift(),
};

const pythonEntry = `
from pathlib import Path
import traceback
import sys
try:
	exec(compile(Path('main.py').read_text(),'main.py','exec'),{})
except Exception as e:
	trace_lines = traceback.format_exc().splitlines()
	relevant_lines = trace_lines[-1:-6:-1][::-1]
	relevant_lines.pop(1)
	relevant_traceback = '\\n'.join(relevant_lines)
	print(relevant_traceback, file=sys.stderr)
`;

async function runCode({ file, input }: IRunnerArgs): Promise<IRunnerOutput> {
	let error = false;
	state.resetWithInput(input);
	console.log("Running code", file);
	pyodide.FS.writeFile("main.py", file);

	try {
		await pyodide.runPythonAsync(pythonEntry);
	} catch (exception) {
		error = true;
		state.stderr.push(...((exception as any).message as string).split("\n"));
	}
	return { stdout: state.stdout, stderr: state.stderr, error };
}

async function handleMessage(data: IRunnerCmd) {
	switch (data.cmd) {
		case "run":
			return runCode(data);
		case "ping":
			return { status: "ok" };
	}
}

let pyodide: PyodideInterface;
declare const loadPyodide: typeof loadPyodideType;
async function load() {
	pyodide = await loadPyodide(pyoditeOptions);
}

importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js");
const loader = load();
addEventListener("message", async ({ data }: { data: IRunnerCmd }) => {
	await loader;
	postMessage({ cmd: data.cmd, ...(await handleMessage(data)) } as IRunnerCmdResponse);
});
