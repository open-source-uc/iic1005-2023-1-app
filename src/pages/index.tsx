import { useState, useMemo } from "react";
import { createPythonInstructor } from "~/lib/pythonInstructor";

import Editor from "@monaco-editor/react";
import clsx from "clsx";

export type Props = {
	exercises: string[];
};

export default function Home() {
	const pythonInstructorPromise = useMemo(createPythonInstructor, []);
	const [code, setCode] = useState<string | undefined>("");
	const [input, setInput] = useState<string | undefined>("");
	const [status, setStatus] = useState({ state: "Esperando", stdout: [""], stderr: [""] });

	const onRun = async () => {
		const pythonInstructor = await pythonInstructorPromise;
		setStatus({ state: "Corriendo", stdout: [], stderr: [] });
		const result = await pythonInstructor.runCode({ file: code ?? "", input: input?.split("\n") ?? [] });
		const error = result.error || result.stderr.length > 0;
		setStatus({ state: error ? "Error" : "Ok", stdout: result.stdout, stderr: result.stderr });
	};

	return (
		<div>
			<summary className="flex items-center py-2 px-6 cursor-pointer bg-base-200 sticky top-0 shadow-xl border-b-2 border-base-300 z-50">
				<div className="flex-grow flex gap-4 items-center">
					<h2 className="text-2xl bold font-bold">DCCorredor de Python</h2>
					<div
						className={clsx(
							"px-2 py-1 rounded-full",
							status.state === "Ok" ? "bg-success text-success-content" : "bg-error text-error-content"
						)}
					>
						{status.state}
					</div>
				</div>
				<div>
					<button className="btn" onClick={onRun}>
						Probar
					</button>
				</div>
			</summary>
			<div className="p-2 flex flex-col gap-2">
				<details open className="bg-base-200 rounded border-base-300 border">
					<summary className="marker:hidden list-none cursor-pointer bg-base-300 p-4">Entrada</summary>
					<div className="p-2">
						<div className="mb-4">
							<div className="p-2 font-bold text-lg">Input</div>
							<Editor
								height="20vh"
								options={{ padding: { top: 8 } }}
								defaultLanguage="textx"
								defaultValue=""
								value={input}
								theme="vs-dark"
								onChange={setInput}
							/>
						</div>
						<div>
							<div className="p-2 font-bold text-lg">Código</div>
							<Editor
								height="30vh"
								options={{ padding: { top: 8 } }}
								defaultLanguage="python"
								defaultValue=""
								value={code}
								theme="vs-dark"
								onChange={setCode}
							/>
						</div>
					</div>
				</details>
				<details open className="bg-base-200 rounded border-base-300 border">
					<summary className="marker:hidden list-none cursor-pointer bg-base-300 p-4">Resultado</summary>
					<div className="flex flex-col gap-4 p-4">
						<div>
							Output
							<pre className="bg-base-300 p-2 rounded-md min-h-16 overflow-y-scroll">{status.stdout.join("\n")}</pre>
						</div>
						<div>
							<span className={clsx({ "text-error": status.state === "Error" })}>Error</span>

							<pre className="bg-base-300 p-2 rounded-md min-h-16 overflow-y-scroll">{status.stderr.join("\n")}</pre>
						</div>
					</div>
				</details>
			</div>
		</div>
	);
}
