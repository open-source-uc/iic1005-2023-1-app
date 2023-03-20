import { useState, useMemo } from "react";
import { createPythonInstructor } from "~/lib/pythonInstructor";

import Editor from "@monaco-editor/react";
import clsx from "clsx";

export type Props = {
	exercises: string[];
};

function Exercise({ name }: { name: string }) {
	const pythonInstructorPromise = useMemo(createPythonInstructor, []);
	const [code, setCode] = useState<string | undefined>("");
	const [input, setInput] = useState<string | undefined>("");
	const [status, setStatus] = useState({ state: "Esperando", stdout: [""], stderr: [""] });

	const onRun = async () => {
		const pythonInstructor = await pythonInstructorPromise;
		setStatus({ state: "Corriendo", stdout: [], stderr: [] });
		const result = await pythonInstructor.runCode({ file: code ?? "", input: input?.split("\n") ?? [] });
		setStatus({ state: result.error ? "Error" : "Ok", stdout: result.stdout, stderr: result.stderr });
		console.log(result);
	};

	return (
		<details open className="border-base-300 border-4">
			<summary className="flex items-center py-2 px-6 cursor-pointer bg-base-200">
				<div className="flex-grow flex gap-4 items-center">
					<h2 className="text-2xl bold font-bold">{name}</h2>
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
			<div className="p-4 flex flex-col gap-2">
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
				<details open className=" bg-base-200 rounded mt-4 border-base-300 border">
					<summary className="marker:hidden list-none cursor-pointer bg-base-300 p-4">Resultado</summary>
					<div className="flex flex-col gap-4 p-4">
						<div>
							Output
							<pre className="bg-base-300 p-2 rounded-md min-h-16 overflow-y-scroll">{status.stdout.join("\n")}</pre>
						</div>
						<div>
							Error
							<pre className="bg-base-300 p-2 rounded-md min-h-16 overflow-y-scroll">{status.stderr.join("\n")}</pre>
						</div>
					</div>
				</details>
			</div>
		</details>
	);
}
export default function Home({ exercises }: Props) {
	return (
		<div className="px-4 py-8">
			<Exercise name="DCCorredor" />
		</div>
	);
}
