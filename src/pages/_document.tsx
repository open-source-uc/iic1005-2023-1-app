import { Html, Head, Main, NextScript } from "next/document";
import { basePath } from "/next.config";

export default function Document() {
	return (
		<Html>
			<Head>
				<link rel="icon" href={`${basePath}/python-dojo.png`} />
				<link rel="prefetch" as="fetch" href="https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js"></link>
				<link rel="prefetch" as="fetch" href="https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.asm.wasm"></link>
				<link rel="prefetch" as="fetch" href="https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.asm.data"></link>
				<link rel="prefetch" as="fetch" href="https://cdn.jsdelivr.net/pyodide/v0.21.3/full/distutils.tar"></link>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
