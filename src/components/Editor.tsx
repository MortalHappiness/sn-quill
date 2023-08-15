import React from 'react';
import EditorKit, { EditorKitDelegate } from '@standardnotes/editor-kit';
import { AppDataField } from '@standardnotes/models';
import ReactQuill from 'react-quill';
import clsx from 'clsx';
import 'react-quill/dist/quill.snow.css';

export interface EditorInterface {
  printUrl: boolean;
  text: string;
}

const initialState = {
  printUrl: false,
  text: '',
};

let keyMap = new Map();

export default class Editor extends React.Component<{}, EditorInterface> {
  private editorKit?: EditorKit;

  private readonly quillModules = {
    toolbar: [
      [{ header: 1 }, { header: 2 }, { header: 3 }],
      [{ font: [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'code'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['direction', { align: [] }],
      ['link', 'image', 'video', 'formula'],
      ['clean'],
    ],
  };

  // See https://quilljs.com/docs/formats/
  private readonly quillFormats = [
    // Inline
    'background',
    'bold',
    'color',
    'font',
    'code',
    'italic',
    'link',
    'size',
    'strike',
    'script',
    'underline',

    // Block
    'blockquote',
    'header',
    'indent',
    'list',
    'align',
    'direction',
    'code-block',

    // Embeds
    'formula',
    'image',
    'video',
  ];

  constructor(props: EditorInterface) {
    super(props);
    this.state = initialState;
  }

  componentDidMount() {
    this.configureEditorKit();
  }

  configureEditorKit = () => {
    const delegate: EditorKitDelegate = {
      /** This loads every time a different note is loaded */
      setEditorRawText: (text: string) => {
        this.setState({
          ...initialState,
          text,
        });
      },
      clearUndoHistory: () => {},
      handleRequestForContentHeight: () => undefined,
    };

    this.editorKit = new EditorKit(delegate, {
      mode: 'html',
    });
  };

  saveText = (text: string) => {
    this.saveNote(text);
    this.setState({
      text: text,
    });
  };

  saveNote = (text: string) => {
    /**
     * This will work in an SN context, but breaks the standalone editor,
     * so we need to catch the error
     */
    try {
      this.editorKit?.onEditorValueChanged(text);
    } catch (error) {
      console.log('Error saving note:', error);
    }
  };

  onBlur = (e: React.FocusEvent) => {};

  onFocus = (e: React.FocusEvent) => {};

  onKeyDown = (e: React.KeyboardEvent | KeyboardEvent) => {
    keyMap.set(e.key, true);
    // Do nothing if 'Control' and 's' are pressed
    if (keyMap.get('Control') && keyMap.get('s')) {
      e.preventDefault();
    }
  };

  onKeyUp = (e: React.KeyboardEvent | KeyboardEvent) => {
    keyMap.delete(e.key);
  };

  render() {
    const { text } = this.state;
    const locked = this.editorKit?.getItemAppDataValue(AppDataField.Locked);
    return (
      <ReactQuill
        readOnly={locked}
        theme="snow"
        modules={this.quillModules}
        formats={this.quillFormats}
        value={text}
        onChange={this.saveText}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
        className={clsx('editor', locked && 'hide-toolbar')}
      />
    );
  }
}
