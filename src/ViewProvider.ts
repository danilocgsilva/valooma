import * as vscode from 'vscode';

export class ViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView
    ): void | Thenable<void> {
        this._view = webviewView;
        webviewView.webview.html = this.getHtmlForWebview(webviewView);
        webviewView.webview.options = {
            enableScripts: true
        };
    }

    private getHtmlForWebview(webview: vscode.WebviewView) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>My Extension View</title>
            <style>
                :root {
                    /* System Fonts */
                    --vscode-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    --vscode-font-size: 13px;
                    --vscode-font-weight: normal;

                    /* Theme Colors (Default Dark Modern Example) */
                    --vscode-editor-background: #1f1f1f;
                    --vscode-editor-foreground: #cccccc;
                    
                    /* Buttons */
                    --vscode-button-background: #007acc;
                    --vscode-button-foreground: #ffffff;
                    --vscode-button-hoverBackground: #0062a3;

                    /* Inputs & Fields */
                    --vscode-input-background: #2b2b2b;
                    --vscode-input-foreground: #cccccc;
                    --vscode-input-border: #3c3c3c;
                    --vscode-input-placeholderForeground: #8c8c8c;

                    /* Interactive States */
                    --vscode-focusBorder: #007acc;
                    --vscode-textLink-foreground: #4fc1ff;
                    --vscode-textLink-activeForeground: #4fc1ff;
                }

                textarea {
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    width: 100%;
                    font-family: sans-serif;
                }
            </style>
            </head>
            <body>
                <h2>Ask</h2>
                <textarea></textarea>
                <script>
                    alert("Hello world!");
                </script>
            </body>
            </html>
        `;
    }
}