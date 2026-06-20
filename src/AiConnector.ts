import * as vscode from "vscode";

export class AiConnector {

  private ollamaHost: string = "";

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

  writeIntoCursor(): vscode.Disposable {
    const disposable = vscode.commands.registerCommand(
      "ai-connector.insertText",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage("No active editor");
          return;
        }

        if (!(await this.isOllamaRunning())) {
          vscode.window.showErrorMessage(
            `Ollama is not running in ${this.ollamaHost}. Please start Ollama and try again.`,
          );
          return;
        } else {
          vscode.window.showInformationMessage(
            "Ollama is running. Wen can begin...",
          );
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
