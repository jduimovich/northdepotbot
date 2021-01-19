const { App, getNodeMiddleware } = require("@octokit/app");
const express = require("express");
const app = express();
const router = express.Router(); 

function run_web_site(port) { 

	// health and liveness checks point here
	var statusCount=0;
	router.get("/status", function (req, res) { 
		statusCount++;
		res.setHeader('Content-Type', 'application/json');
		res.send({ "status": 'OK', "statusCount": statusCount  });
	});

	app.use(express.static('html'));
	app.use("/", router);   
	app.listen(port, function () {
		console.log("Static site hosted on port", port);
	});
}

async function run_github_apps_handler(port) {
	const app = new App({
		appId: process.env.APP_ID,
		privateKey: process.env.PRIVATE_KEY,
		oauth: {
			clientId: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
		},
		webhooks: {
			secret: "secret",
		},
	});
	const { data } = await app.octokit.request("/app");
	console.log("authenticated as %s", data.name);

	for await (const { octokit, repository } of app.eachRepository.iterator()) {
		console.log("----------------");
		console.log(repository.owner.login);
		console.log(repository.name);
		console.log("----------------");
	}

	app.webhooks.on("issues.opened", async ({ octokit, payload }) => {
		await octokit.request(
			"POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
			{
				owner: payload.repository.owner.login,
				repo: payload.repository.name,
				issue_number: payload.issue.number,
				body: "OpenShift App auto comment on your issue",
			}
		);
	});

	app.oauth.on("token", async ({ token, octokit }) => {
		const { data } = await octokit.request("GET /user");
		console.log(`Token retrieved for ${data.login}`);
	});
	require("http").createServer(getNodeMiddleware(app)).listen(port);
	console.log("Autobot hosted on port", port);
}

run_github_apps_handler(8081);
run_web_site(8080) 