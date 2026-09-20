import * as vscode from 'vscode';

export class ViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public async resolveWebviewView(webviewView: vscode.WebviewView): Promise<void> {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'media')]
        };

        webviewView.webview.html = await this.getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'submitForm') {
                const aiHost = this.getAiHost();
                try {
                    const response = await fetch('http://' + aiHost + "/api/tags", {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(message.payload)
                    });
                    const result = await response.json();
                    webviewView.webview.postMessage({ command: 'formResult', result });
                } catch (err) {
                    webviewView.webview.postMessage({ command: 'formResult', error: String(err) });
                }
            }
        });
    }

    private async getHtmlForWebview(webview: vscode.Webview): Promise<string> {
        const nonce: string = getNonce();

        const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'webview', 'ask.html');

        const uint8array = await vscode.workspace.fs.readFile(htmlPath);
        const html = new TextDecoder('utf-8').decode(uint8array);

        const updatedHtml = html
            .replace(/{{cspSource}}/g, webview.cspSource)
            .replace(/{{nonce}}/g, nonce)
            .replace(/{{aiHost}}/g, this.getAiHost())
        ;

        return updatedHtml;
    }
    
    private getAiHost(): string {
        return vscode.workspace
            .getConfiguration('ai-connector')
            .get<string>('ai_host', 'https://localhost');
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
