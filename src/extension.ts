import * as vscode from 'vscode';
import { AiConnector } from './AiConnector';

const aiConnector = new AiConnector();

function updateConfig(): string {
	const config = vscode.workspace.getConfiguration('ai-connector');
	const aiHost = config.get<string>('ai_host') || 'localhost';
	return aiHost;
}

export function activate(context: vscode.ExtensionContext) {
	// Initial setup
	const initialHost = updateConfig();
	aiConnector.setOllamaHost(initialHost);

	const writeIntoCursor: vscode.Disposable = aiConnector.getDisposable("ai-connector.insertText");
	const testOllamaServer: vscode.Disposable = aiConnector.getDisposable("ai-connector.testOllamaServer");

	context.subscriptions.push(writeIntoCursor);
	context.subscriptions.push(testOllamaServer);

	// Listen for config changes
	const configurationListener = vscode.workspace.onDidChangeConfiguration(async (e) => {
		if (e.affectsConfiguration('ai-connector.ai_host')) {
			const newHost = updateConfig();
			aiConnector.setOllamaHost(newHost);
		}
	});
	context.subscriptions.push(configurationListener);
}

export function deactivate() {}
