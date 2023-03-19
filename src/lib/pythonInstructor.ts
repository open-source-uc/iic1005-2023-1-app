import { IRunnerCmdResponse, IRunnerOutput, IRunnerArgs } from "~/types/python.worker";

type Resolver = (data: IRunnerOutput) => void;
type IPostMessage = (msg: IRunnerCmdResponse) => void;
type PythonWorker = { postMessage: IPostMessage } & Worker;

let nextId = 0;
const id = () => nextId++;

export type PythonInstructor = {
	id: number;
	runCode: (args: IRunnerArgs) => Promise<IRunnerOutput>;
	destroy: () => void;
};

export const createPythonInstructor = (): Promise<PythonInstructor> =>
	new Promise((createResolver) => {
		// allow for server side rendering
		if (typeof window === "undefined") (createResolver as any)(undefined);

		const w: PythonWorker = new Worker(new URL("../python.worker.ts", import.meta.url));
		const interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));
		let currentResolver: Resolver | undefined = undefined;
		let isRunning = false;

		const response = {
			id: id(),
			destroy: () => w.terminate(),
			runCode: (args: IRunnerArgs) => {
				if (isRunning) throw new Error("Cannot run code while running another code");
				interruptBuffer[0] = 0;
				isRunning = true;
				const promise: Promise<IRunnerOutput> = new Promise((runnerResolver) => (currentResolver = runnerResolver));
				w.postMessage({ cmd: "run", ...args });
				return promise;
			},
			interrupt: () => {
				interruptBuffer[0] = 2;
			},
		};

		const handleEvent = ({ data }: { data: IRunnerCmdResponse }) => {
			switch (data.cmd) {
				case "ping":
					return createResolver(response);
				case "run":
					if (currentResolver && isRunning) {
						const { cmd, ...result } = data;
						currentResolver(result);
						isRunning = false;
					}
			}
		};

		w.addEventListener("message", handleEvent);
		w.postMessage({ cmd: "ping" });
	});
