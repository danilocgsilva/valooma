import * as vscode from "vscode";

export class AiConnector {
  private ollamaHost: string = "";

  private commandIdentifier = "ai-connector.insertText";

  private testOllamaServerIdentifier = "ai-connector.testOllamaServer";

  private manageExtensionIdentifier = "ai-connector.manageExtension";

  private settingsPageIdentifier = "ai-connector.openSettings";

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
    if (disposableIdentifier === this.manageExtensionIdentifier) {
      return this.getManageExtension();
    }
    if (disposableIdentifier === this.settingsPageIdentifier) {
      return this.getSettingsPage();
    }
    throw Error("Not valid disposable name.");
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

  private getSettingsPage(): vscode.Disposable {
    const disposable = vscode.commands.registerCommand(
      this.settingsPageIdentifier,
      async () => {
        const panel = vscode.window.createWebviewPanel(
          "aiConnectorSettings",
          "AI Connector Settings",
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
          },
        );

        const config = vscode.workspace.getConfiguration("ai-connector");
        const aiHost = config.get<string>("ai_host") || "localhost";
        panel.webview.html = this.getSettingsHtml(aiHost, panel);
        panel.webview.onDidReceiveMessage(
          async (message) => {
            switch (message.command) {
              case "updateHost":
                await vscode.workspace
                  .getConfiguration("ai-connector")
                  .update("ai_host", message.host, true);
                this.setOllamaHost(message.host);
                vscode.window.showInformationMessage("Settings updated!");
            }
          },
          undefined,
          undefined,
        );
      },
    );

    return disposable;
  }

  private getSettingsHtml(aiHost: string, panel: vscode.WebviewPanel): string {
    return `
          <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>AI Connector Settings</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                  padding: 20px;
                  background-color: #f5f5f5;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              h1 {
                  color: #333;
                  text-align: center;
              }
              .setting-group {
                  margin-bottom: 20px;
              }
              label {
                  display: block;
                  margin-bottom: 5px;
                  font-weight: bold;
              }
              input[type="text"] {
                  width: 100%;
                  padding: 8px;
                  border: 1px solid #ddd;
                  border-radius: 4px;
                  box-sizing: border-box;
              }
              button {
                  background-color: #007acc;
                  color: white;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 14px;
              }
              button:hover {
                  background-color: #005a9e;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>AI Connector Settings</h1>
              
              <div class="setting-group">
                  <label for="aiHost">AI Host Address:</label>
                  <input type="text" id="aiHost" value="${aiHost}">
              </div>
              
              <button onclick="saveSettings()">Save Settings</button>
          </div>

          <script>
              function saveSettings() {
                  const host = document.getElementById('aiHost').value;
                  const message = {
                      command: 'updateHost',
                      host: host
                  };
                  vscode.postMessage(message);
              }
              
              // Handle messages from VS Code
              window.addEventListener('message', event => {
                  const message = event.data;
                  if (message.command === 'updateHost') {
                      document.getElementById('aiHost').value = message.host;
                  }
              });
          </script>
      </body>
      </html>
    `;
  }
}
