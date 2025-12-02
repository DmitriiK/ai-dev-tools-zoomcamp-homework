We will implement a platform for online coding interviews.

The app should be able to do the following:

- Create a link and share it with candidates
- Allow everyone who connects to edit code in the code panel
- Show real-time updates to all connected users
- Support syntax highlighting for multiple languages
- Execute code safely in the browser. For security reasons, we don't want to execute code directly on the server. Instead, let's use WASM to execute the code only in the browser. Let's assume we support JavaScript, Python, C#, Go and Java. AND SQL (Postgres, without execution of course)

Use React plus TypeScript for FrontEnd and FAST API for BE (but if you think that there is some technology that is more appropriate for that task let me know)
The code for app should include tests, both for FE, BE, and integration tests.
As a first step create
- implementation plan as separate md file. 
- OpenAPI specification