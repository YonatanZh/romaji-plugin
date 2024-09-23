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
	isPluginOn = false;
	previousContent = "";

	async onload() {
		await this.loadSettings();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		this.pluginIndicator = this.addStatusBarItem();
		this.updateIndicator();

		// This grabs the text of the file that is being opened
		this.app.workspace.on('file-open', (file) => {
            const activeLeaf = this.app.workspace.activeLeaf;
            if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
                this.previousContent = activeLeaf.view.editor.getValue();
				console.log(this.previousContent);
            }
        });

		// This calls the function handleChange whenever the editor changes
		this.app.workspace.on('editor-change', this.handleChange);

		this.addCommand({
			id: 'live-translate-switch',
			name: 'activate live translate',
			callback: () => {
				this.isPluginOn = !this.isPluginOn;
				this.updateIndicator();
			}
		});

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// when pressing the status bar item, the plugin will toggle the isPluginOn variable
		this.registerDomEvent(this.pluginIndicator, 'click', (evt: MouseEvent) => {
			this.isPluginOn = !this.isPluginOn;
			this.updateIndicator();
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

	private handleChange = (editor: Editor, view: MarkdownView) => {
		const cursor = editor.getCursor();
		const lineContent = editor.getLine(cursor.line).slice(0, cursor.ch);
		console.log(lineContent);
	}
	onunload() {

	}


	// sets the setting to the default value
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	// saves the setting into a file named data.json
	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	s = "Woah!";
	constructor(app: App, s?: string) {
		super(app);
		if (s) {
			this.s = s;
		}
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText(this.s);
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
