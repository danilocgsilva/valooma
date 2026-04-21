import * as vscode from 'vscode';

function getOllamaHost(): string {
	return 'host.docker.internal';
}

function getModel(): string {
	return "qwen2.5-coder:latest";
}

async function isOllamaRunning(ollamaHost: string) {
	try {
		const res = await fetch(`http://${ollamaHost}:11434/api/tags`);
		return res.ok;
	} catch {
		return false;
	}
}

function writeIntoCursor(): vscode.Disposable {
	const disposable = vscode.commands.registerCommand('ai-connector.insertText', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor');
			return;
		}

		const ollamaHost = getOllamaHost();
		if (!(await isOllamaRunning(ollamaHost))) {
			vscode.window.showErrorMessage('Ollama is not running. Please start Ollama and try again.');
			return;
		} else {
			vscode.window.showInformationMessage('Ollama is running. Wen can begin...');
		}

		const position = editor.selection.active;

		await editor.edit(editBuilder => {
			editBuilder.insert(position, 'Hello from AI Connector! New insert!');
		});
	});

	return disposable;
}

export function activate(context: vscode.ExtensionContext) {

	const writeIntoCursorDisposable = writeIntoCursor();

	context.subscriptions.push(writeIntoCursorDisposable);
}

export function deactivate() {}
