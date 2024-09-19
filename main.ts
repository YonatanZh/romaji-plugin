import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as wanakana from 'wanakana';

// Remember to rename these classes and interfaces!

interface RomajiPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: RomajiPluginSettings = {
	mySetting: 'default'
}

export default class RomajiPlugin extends Plugin {
	settings: RomajiPluginSettings;
	pluginIndicator: HTMLElement;
	isPluginOn = true;

	async onload() {
		await this.loadSettings();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		this.pluginIndicator = this.addStatusBarItem();
		this.updateIndicator();










		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				// opens up a new window
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				// This will replace the current selection in the editor with the text 'Sample Editor Command'
				// and log the current selection to the console
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});


		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// when pressing the status bar item, the plugin will toggle the isPluginOn variable
		this.registerDomEvent(this.pluginIndicator, 'click', (evt: MouseEvent) => {
			this.isPluginOn = !this.isPluginOn;
			this.updateIndicator();
			console.log(this.isPluginOn);
		});









		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));



		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	private updateIndicator() {
		// this.pluginIndicator.setText(`Romaji - ${this.isPluginOn ? 'On' : 'Off'}`);
		if (this.isPluginOn) {
			this.pluginIndicator.setText(`Romaji ✓`);
		} else {
			this.pluginIndicator.setText(`Romaji ✗`);
		}
	}
	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: RomajiPlugin;

	constructor(app: App, plugin: RomajiPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
