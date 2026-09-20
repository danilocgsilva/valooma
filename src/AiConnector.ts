import * as vscode from "vscode";
import { ViewProvider } from './ViewProvider';

export class AiConnector {
  private ollamaHost: string = "";

  private commandIdentifier = "ai-connector.insertText";

  private testOllamaServerIdentifier = "ai-connector.testOllamaServer";

  private manageExtensionIdentifier = "ai-connector.manageExtension";

  private sidebar = "ai-connector.valoomaPanel";

  public setOllamaHost(ollamaHost: string) {
    this.ollamaHost = ollamaHost;
  }

  async isOllamaRunning() {
    try {
      const res = await fetch(`http://${this.ollamaHost}:11434/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  }

  private async testOllamaConnection(): Promise<boolean> {
    if (!(await this.isOllamaRunning())) {
      vscode.window.showErrorMessage(
        `Ollama is not running in ${this.ollamaHost}. Please start Ollama and try again.`,
      );
      return false;
    } else {
      vscode.window.showInformationMessage(
        "Ollama is running. Wen can begin...",
      );
      return true;
    }
  }

  async getDisposable(disposableIdentifier: string, context?: vscode.ExtensionContext): Promise<vscode.Disposable> {
    if (disposableIdentifier === this.commandIdentifier) {
      return this.getWriteIntoCursor();
    }
    if (disposableIdentifier === this.testOllamaServerIdentifier) {
      return this.getOllamaServerTester();
    }
    if (disposableIdentifier === this.manageExtensionIdentifier) {
      return this.getManageExtension();
    }
    if (disposableIdentifier === this.sidebar && context !== undefined) {
      return this.getSidebar(context);
    }
    throw Error("Not valid disposable name.");
  }

  private getSidebar(context: vscode.ExtensionContext): vscode.Disposable {
    const viewProvider = new ViewProvider(context.extensionUri);
    return vscode.window.registerWebviewViewProvider(
      this.sidebar,
      viewProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    );
  }

  private getOllamaServerTester(): vscode.Disposable {
    const disposable = vscode.commands.registerCommand(
      this.testOllamaServerIdentifier,
      async () => {
        !(await this.testOllamaConnection());
      },
    );

    return disposable;
  }

  private getWriteIntoCursor(): vscode.Disposable {
    const disposable = vscode.commands.registerCommand(
      this.commandIdentifier,
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage("No active editor");
          return;
        }

        if (!(await this.testOllamaConnection())) {
          return;
        }

        const position = editor.selection.active;

        await editor.edit((editBuilder) => {
          editBuilder.insert(position, "Hello from AI Connector! New insert!");
        });
      },
    );

    return disposable;
  }

  private getManageExtension(): vscode.Disposable {
    const disposable = vscode.commands.registerCommand(
      this.manageExtensionIdentifier,
      () => {
        vscode.commands.executeCommand("workbench.view.extensions");
      },
    );

    return disposable;
  }
}

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}