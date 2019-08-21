import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class FileUploadControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _fileElement: HTMLInputElement;
	private _submitButton: HTMLElement;
	private _breakElement: HTMLElement;
	private _fileName: string;
	private _fileSize: number;
	private _fileType: string;
	private _content: any;
	private _submitClicked: EventListenerOrEventListenerObject;
	private _fileChanged: EventListenerOrEventListenerObject;
	private _fileReaderLoadened: EventListenerOrEventListenerObject;
	private _context: ComponentFramework.Context<IInputs>;
	private _notifyOutputChanged: () => void;
	private _container: HTMLDivElement;
	private fileReader: FileReader = new FileReader();
	
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
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		// Add control initialization code
		this._context = context;
		this._notifyOutputChanged = notifyOutputChanged;
		this._container = container;

		this._submitClicked = this.submitClicked.bind(this)
		this._fileChanged = this.fileChanged.bind(this);
		this._fileReaderLoadened = this.fileReaderLoadend.bind(this);

		this._fileElement = document.createElement("input");
		this._fileElement.setAttribute("type", "file");
		this._fileElement.addEventListener("change", this._fileChanged);

		this._breakElement = document.createElement("br");

		// this._submitButton = document.createElement("input");
		// this._submitButton.setAttribute("type", "button");
		// this._submitButton.setAttribute("value", "Submit");
		// this._submitButton.addEventListener("click", this._submitClicked);

		this.fileReader.addEventListener("loadend", this._fileReaderLoadened);

		this._container.appendChild(this._fileElement); 
        this._container.appendChild(this._breakElement); 
        // this._container.appendChild(this._submitButton); 
	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
		// this._value = context.parameters.FieldName.raw;
		// this._context = context;
		// this.textareaElement.setAttribute("value", context.parameters.FieldName.formatted ? context.parameters.FieldName.formatted : "");
		var crmFileNameAttr = context.parameters.FileName.raw;
		var crmFileSizeAttr = context.parameters.FileSize.raw;
		this._context = context;
		this._fileElement.setAttribute("value", crmFileNameAttr);
		this._fileSize = crmFileSizeAttr;
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			FileName: this._fileName, 
			FileSize: this._fileSize,
			Content: this._content,
			FileType: this._fileType
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
		this._fileElement.removeEventListener("change", this._fileChanged); 
		this._submitButton.removeEventListener("click", this._submitClicked);
		this.fileReader.removeEventListener("loadend", this._fileReaderLoadened);
	}

	// event handlers 
    public fileChanged(evt: Event): void { 
        debugger; 
         var files = this._fileElement.files;
        if (files != null && files.length > 0) { 
            var file = files[0];
			
            this._fileName = file.name; 
			this._fileSize = file.size;
			this._fileType = file.type;

			this.fileReader.readAsDataURL(file);

            // this will call the getOutputs method. 
            this._notifyOutputChanged(); 
        } 
	}
	
	public fileReaderLoadend(): void {
		this._content = this.fileReader.result;
		console.log(this.fileReader.result);
	}

    public submitClicked(evt: Event): void { 
        // do your file processing here 
        var files = this._fileElement.files;
        if(files != null && files.length > 0) { 
            var file = files[0];
            var fileSize = file.size;
            if (fileSize > 1048576) { 
                // you can alert here…for brevity showing Xrm.Utility..you should use Xrm.Navigation 
                alert("File size should be less than 1 MB");
                this._fileName = ""; 
                this._fileSize = 0;
                this._notifyOutputChanged(); 
            } else {
                alert("File uploaded");
			}
        } 
    } 
}