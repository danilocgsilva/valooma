import * as vscode from 'vscode';
import { AiConnector } from './AiConnector';

const aiConnector = new AiConnector();

function updateConfig(): string {
	const config = vscode.workspace.getConfiguration('ai-connector');
	const aiHost = config.get<string>('ai_host') || 'localhost';
	return aiHost;
}

export async function activate(context: vscode.ExtensionContext) {
	const initialHost = updateConfig();
	aiConnector.setOllamaHost(initialHost);

	const valoomaSidebar: vscode.Disposable = await aiConnector.getDisposable("ai-connector.valoomaPanel", context);
	context.subscriptions.push(valoomaSidebar);

	const writeIntoCursor: vscode.Disposable = await aiConnector.getDisposable("ai-connector.insertText");
	context.subscriptions.push(writeIntoCursor);

	const testOllamaServer: vscode.Disposable = await aiConnector.getDisposable("ai-connector.testOllamaServer");
	context.subscriptions.push(testOllamaServer);

	const extensionManager: vscode.Disposable = await aiConnector.getDisposable("ai-connector.manageExtension");
	context.subscriptions.push(extensionManager);

	const configurationListener = vscode.workspace.onDidChangeConfiguration(async (e) => {
		if (e.affectsConfiguration('ai-connector.ai_host')) {
			const newHost = updateConfig();
			aiConnector.setOllamaHost(newHost);
		}
	});
	context.subscriptions.push(configurationListener);
}

export function deactivate() {}
