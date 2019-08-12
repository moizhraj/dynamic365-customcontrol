import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { UploadAdapter } from "./adapters/UplaodAdapter";
//import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
const ClassicEditor = require( '@ckeditor/ckeditor5-build-classic' );

export class HtmlEditorControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	// Value of the field is stored and used inside the control 
	private _value: string;
	// PCF framework delegate which will be assigned to this object which would be called whenever any update happens. 
	private _notifyOutputChanged: () => void;
	// label element created as part of this control
	// private labelElement: HTMLLabelElement;
	// input element that is used to create the range slider
	//private inputElement: HTMLInputElement;
	private textareaElement: HTMLTextAreaElement;
	// Reference to the control container HTMLDivElement
	// This element contains all elements of our custom control example
	private _container: HTMLDivElement;
	// Reference to ComponentFramework Context object
	private _context: ComponentFramework.Context<IInputs>;
	// Event Handler 'refreshData' reference
	private _refreshData: EventListenerOrEventListenerObject;

	/**
	 * Empty constructor.
	 */
	constructor() {
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
		// Add control initialization code
		this._context = context;
		this._container = document.createElement("div");
		this._notifyOutputChanged = notifyOutputChanged;
		this._refreshData = this.refreshData.bind(this);
		
		// creating HTML elements for the input type range and binding it to the function which refreshes the control data
		this.textareaElement = document.createElement("textarea");
		this.textareaElement.setAttribute("class", context.parameters.FieldName + "-editor-control");
		//this.textareaElement.setAttribute("id", "editor-control");
		this.textareaElement.addEventListener("input", this._refreshData);
		
		


		// this.inputElement = document.createElement("input");
		// this.inputElement.setAttribute("type", "range");
		// this.inputElement.addEventListener("input", this._refreshData);
		
		// setting the max and min values for the control.
		// this.inputElement.setAttribute("min", "1");
		// this.inputElement.setAttribute("max", "1000");
		// this.inputElement.setAttribute("class", "linearslider");
		// this.inputElement.setAttribute("id", "linearrangeinput");
		
		// creating a HTML label element that shows the value that is set on the linear range control
		// this.labelElement = document.createElement("label");
		// this.labelElement.setAttribute("class", "TS_LinearRangeLabel");
		// this.labelElement.setAttribute("id", "lrclabel");
		
		// retrieving the latest value from the control and setting it to the HTMl elements.
		this._value = context.parameters.FieldName.raw;
		this.textareaElement.setAttribute("value", context.parameters.FieldName.formatted ? context.parameters.FieldName.formatted : "");
		// this.inputElement.setAttribute("value", context.parameters.sliderValue.formatted ? context.parameters.sliderValue.formatted : "0");
		// this.labelElement.innerHTML = context.parameters.FieldName.formatted ? context.parameters.FieldName.formatted : "0";
		
		// appending the HTML elements to the control's HTML container element.
		this._container.appendChild(this.textareaElement);
		// this._container.appendChild(this.labelElement);
		container.appendChild(this._container);


		ClassicEditor
			.create( document.querySelector( '.' + context.parameters.FieldName + '-editor-control' ), {
				extraPlugins: [ this.editorUploadAdapterPlugin ],
			})
			.then( (editor: any) => {
				console.log(editor);
			})
			.catch( (error: any) => {
				console.error(error);
				alert('There was an error uploading your image to server. Please try again.');
			});
	}

	public editorUploadAdapterPlugin(editor: any) {
		editor.plugins.get('FileRepository').createUploadAdapter = function(loader: any) {
			console.log(loader);
			return new UploadAdapter(loader);
		};
	}

	/**
	 * Updates the values to the internal value variable we are storing and also updates the html label that displays the value
	 * @param context : The "Input Properties" containing the parameters, control metadata and interface functions
	 */

	public refreshData(evt: Event): void {
		this._value = (this.textareaElement.value as any) as string;
		// this.labelElement.innerHTML = this.textareaElement.value;
		this._notifyOutputChanged();
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		// Add code to update control view
		this._value = context.parameters.FieldName.raw;
		this._context = context;
		this.textareaElement.setAttribute("value", context.parameters.FieldName.formatted ? context.parameters.FieldName.formatted : "");
		// this.labelElement.innerHTML = context.parameters.FieldName.formatted ? context.parameters.FieldName.formatted : "";
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return {
			FieldName: this._value
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void {
		// Add code to cleanup control if necessary
		this.textareaElement.removeEventListener("textarea", this._refreshData);
	}
}

