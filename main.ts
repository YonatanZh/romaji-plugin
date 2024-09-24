import {App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';
import * as wanakana from 'wanakana';

const VOWELS = ['a', 'i', 'u', 'e', 'o'];

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
	toTranslate = "";
	isN = false;

	async onload() {
		await this.loadSettings();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		this.pluginIndicator = this.addStatusBarItem();
		this.updateState();

		// This grabs the text of the file that is being opened
		this.app.workspace.on('file-open', (file) => {
			const activeLeaf = this.app.workspace.activeLeaf;
			if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
				this.previousContent = activeLeaf.view.editor.getValue();
			}
		});

		// This calls the function handleChange whenever the editor changes
		this.app.workspace.on('editor-change', this.handleChange);


		this.addCommand({
			id: 'live-translate-switch',
			name: 'activate live translate',
			callback: () => {
				this.isPluginOn = !this.isPluginOn;
				this.updateState();
			}
		});

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// when pressing the status bar item, the plugin will toggle the isPluginOn variable
		this.registerDomEvent(this.pluginIndicator, 'click', (evt: MouseEvent) => {
			this.isPluginOn = !this.isPluginOn;
			this.updateState();
		});


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));


		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.clear(), 60 * 1000));
	}

	private updateState() {
		this.pluginIndicator.setText(`Romaji ${this.isPluginOn ? '✓' : '✗'}`);
		this.toTranslate = "";
	}

	private handleChange = (editor: Editor, view: MarkdownView) => {
		const newContent = editor.getValue();
		const diff = this.getDiff(this.previousContent, newContent);
		this.previousContent = newContent;
		// console.log('diff-', diff);

		//todo have a problem when jibrish is written the plugin breaks
		//todo if cursor is not last character it breaks - i.e. if you write in the middle of a word or a text
		if (this.isPluginOn && !this.isWhitespace(diff)) {
			if (this.isN) {
				this.specialNTranslate(editor, diff);
			} else {
				console.log("added to translate-", diff);
				this.toTranslate += diff;
				this.translate(editor);
			}
		} else if (this.isWhitespace(diff)) {
			this.isN = false;
		}
	}

	private getDiff(oldContent: string, newContent: string): string {
		if (newContent.length > oldContent.length) {
			return newContent.slice(oldContent.length);
		}
		return '';
	}

	private isWhitespace(char: string): boolean {
		return /\s/.test(char) && char !== ' ';
	}

	private checkForN() {
		this.isN = this.toTranslate[this.toTranslate.length - 1] === "n";
	}

	private translate(editor: Editor) {
		const translated = wanakana.toKana(this.toTranslate, {customKanaMapping: {' ': '　'}});

		if (wanakana.isJapanese(translated,)) {
			const pos = {line: editor.getCursor().line, ch: editor.getCursor().ch - this.toTranslate.length};
			this.checkForN();
			this.toTranslate = "";
			editor.replaceRange(translated, pos, editor.getCursor());
			console.log('res-', translated);
		}
	}

	private specialNTranslate(editor: Editor, diff: string) {
		if (VOWELS.some(vowel => vowel === diff)) {
			this.toTranslate = "n" + diff;
			this.isN = false;
		} else if (diff === "n") {
			this.toTranslate = diff;
		}
		this.translate(editor);
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
