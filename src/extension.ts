/* --------------------------------------------------------------------------------------------
 * Copyright (c) Kiad Studios, LLC. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import * as fs from 'fs';

import { window, languages, workspace, commands, Uri, Range, Disposable, ExtensionContext, TextDocument, CancellationToken, DocumentLink, extensions } from 'vscode';
import { LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, TransportKind } from 'vscode-languageclient';

let languageServerId = 'flint';
let extensionPath = '';

function normalize(path: string): string {
	if (path.charAt(0) != '/') {
		return extensionPath + '/' + path
	}
	return path
}

// Launches the Swift Language Server tool.
function registerSwiftLanguageServer(context: ExtensionContext) {
	let config = workspace.getConfiguration(languageServerId);
	let langsrvPath = normalize(config.get('languageServerPath', 'lib/usr/bin/langsrv'));
	let debugOptions = ["--nolazy", "--debug=6009"];

	fs.exists(langsrvPath, (exists: boolean) => {
		if (exists) {
			// TODO(owensd): Think about doing PATCH level updates here.

			let serverOptions: ServerOptions = {
				run : { command: langsrvPath },
				debug: { command: langsrvPath, args: debugOptions }
			}
			
			let clientOptions: LanguageClientOptions = {
				documentSelector: [{ scheme: 'file', language: 'flint' }],
				synchronize: {
					configurationSection: languageServerId,
					fileEvents: workspace.createFileSystemWatcher('**/.flint'),
				}
			}
			
			let swiftLanguageServer = new LanguageClient(languageServerId, 'Flint Language Server', serverOptions, clientOptions);
			context.subscriptions.push(swiftLanguageServer.start());
		}
		else {
			window.showErrorMessage("Unable to find the langsrc executable");
		}
	});
}

export function activate(context: ExtensionContext) {
	extensionPath = context.extensionPath;
	let config = workspace.getConfiguration(languageServerId);
	let enableLanguageServer = config.get('enableLanguageServer', true);
	if (enableLanguageServer) { registerSwiftLanguageServer(context); }
}
