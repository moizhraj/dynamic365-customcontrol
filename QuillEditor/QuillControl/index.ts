import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as Q from 'quill'
import { fileURLToPath } from "url";
const Quill: any = Q

interface IToolbar {
	toolbar: Array<any>;
}

export class QuillControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _value: string;
	private _notifyOutputChanged: () => void;
	private _toolbarOptions: IToolbar;
	private _container: HTMLDivElement;
	private _context:ComponentFramework.Context<IInputs>;
	private _editorContainer: HTMLDivElement;
	private _editor: any;
	private _fileInput: HTMLInputElement;

	/**
	 * Empty constructor.
	 */
	constructor() {
		this._toolbarOptions = {
			"toolbar": [
				{ "font": ["", "serif", "monospace"] },
				{ "header": [1, 2, 3, 4, 5, 6, 0] },
				"bold",
				"italic",
				"underline",
				"link",
				{ "align": [ "", "right", "center", "justify" ] },
				{ "color": [ "#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466" ] },
				{ "background": [ "#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466" ] },
				{ "list": "ordered" },
				{ "list": "bullet" },
				"blockquote",
				"code-block",
				//{ "handlers": { "image": this.imageHandler } },
				"image",
				"video"
			]
		}
	}

	public imageHandler() {
		console.log('Uploading image');
		this._fileInput = document.createElement("input");
		this._fileInput.setAttribute('type', 'file');
		this._fileInput.setAttribute('accept', 'image/*');
		this._fileInput.click();
		this._fileInput.onchange = (el: Event) => {
			if(this._fileInput.files !== null && this._fileInput.files[0] !== null) {
				console.log(this._fileInput.files[0].name);
				this.uploadImage(this._fileInput.files[0])
					.then( (response: any) => {
						console.log(response);
						const range = this._editor.getSelection();
						this._editor.insertEmbed(range.index, 'image', response);
					})
					.catch((ex) => {
						console.log(ex);
						alert("There was an error uploading the image to server!");
					});
			}
		}
	}

	public uploadImage(file: File) {
		return new Promise((resolve, reject) => {
			//TODO: make XHR Request to upload
			setTimeout(() => resolve("http://www.microsoft.com"), 1000);
		});
	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement) {
		this._context = context;
		this._notifyOutputChanged = notifyOutputChanged;

		// if(context.parameters.enableImages!.raw == "Yes") {
		// 	this._toolbarOptions.toolbar[0].push("image");
		// }
		// if(context.parameters.enableVideo!.raw == "Yes") {
		// 	this._toolbarOptions.toolbar[0].push("video");
		// }

		this._container = document.createElement("div");
		this._editorContainer = document.createElement("div");
		this._container.appendChild(this._editorContainer);
		this._editor = new Quill(this._editorContainer, {
			modules: this._toolbarOptions,
			theme: 'snow',
			readOnly: context.mode.isControlDisabled,
			placeholder: 'Enter your details here!'
		});
		this._editor.container.childNodes[0].innerHTML = context.parameters.field.raw;
		this._editor.on('text-change', () => {
			this._value = this._editor.container.childNodes[0].innerHTML;
			this._notifyOutputChanged();
		});
		this._editor.getModule('toolbar').addHandler('image', () => {
			this.imageHandler();
		});
		
		container.appendChild(this._container);
		let toolbar = document.getElementsByClassName("ql-toolbar")[0];
		toolbar.setAttribute("style", "display:" + (context.mode.isControlDisabled ? "none": "block"));
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
		this._editor.enable(!context.mode.isControlDisabled);
		let toolbar = document.getElementsByClassName("ql-toolbar")[0];
		toolbar.setAttribute("style", "display:" + (context.mode.isControlDisabled ? "none": "block"));
		this._value = context.parameters.field.raw;
		this._context = context;
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			field: this._value
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
		this._editor.off('text-change');
	}
}