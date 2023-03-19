export type IRunnerArgs = {
	file: string;
	input: string[];
};

export type IRunnerCmd = { cmd: "ping" } | ({ cmd: "run" } & IRunnerArgs);

export type IRunnerOutput = {
	stdout: string[];
	stderr: string[];
	error: boolean;
};

export type IRunnerCmdResponse = { cmd: "ping"; status: "ready" } | ({ cmd: "run" } & IRunnerOutput);
