import * as vscode from "vscode";

export class AiConnector {
  private ollamaHost: string = "";

  private commandIdentifier = "ai-connector.insertText";

  private testOllamaServerIdentifier = "ai-connector.testOllamaServer";

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

  getDisposable(disposableIdentifier: string): vscode.Disposable {
    if (disposableIdentifier === this.commandIdentifier) {
      return this.getWriteIntoCursor();
    }
    if (disposableIdentifier === this.testOllamaServerIdentifier) {
      return this.getOllamaServerTester();
    }
    throw Error("Not valid disposable name.");
  }

  private getOllamaServerTester(): vscode.Disposable {
    const disposable = vscode.commands.registerCommand(
      this.testOllamaServerIdentifier,
      async () => {
        !await this.testOllamaConnection();
      }
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

        if (! await this.testOllamaConnection()) {
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
}
