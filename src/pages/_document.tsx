import { Html, Head, Main, NextScript } from "next/document";
import { basePath } from "/next.config";

export default function Document() {
	return (
		<Html>
			<Head>
				<link rel="icon" href={`${basePath}/python-dojo.png`} />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
