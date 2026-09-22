import 'jsoneditor/dist/jsoneditor.css';

import { Control, useController } from 'react-hook-form';
import JSONEditor, { JSONEditorOptions } from 'jsoneditor';
import React, { useEffect, useRef } from 'react';

interface JsonEditorProps {
  control: Control<any, any>;
  name: string;
  initialValue?: any;
}

const JsonEditor = React.memo(({ control, name, initialValue }: JsonEditorProps) => {
  /**
   * Memoized `JsonEditor` component for rendering and editing JSON data.
   * - Uses `react-hook-form`'s `useController` to handle form control and manage the state of the JSON data.
   * - The component initializes a `JSONEditor` instance inside a `useEffect` hook, which is configured with `tree` and `code` modes.
   * - Supports updating the form state on changes in the JSON data, and initializes with an optional `initialValue`.
   */
  const {
    field: { onChange },
  } = useController({
    name,
    control,
  });

  const editorRef = useRef<JSONEditor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    /**
     * Effect hook to initialize the JSONEditor instance when the component is mounted.
     * - Sets up the editor with 'tree' and 'code' modes for JSON editing.
     * - Handles changes in the JSON data and updates the form state using `onChange` from `useController`.
     * - Cleans up by destroying the editor instance when the component is unmounted.
     */
    if (editorContainerRef.current && !isInitializedRef.current) {
      const options: JSONEditorOptions = {
        mode: 'tree',
        modes: ['code', 'tree'],
        onChangeJSON: json => {
          try {
            onChange(json);
          } catch (error) {
            console.error('Invalid JSON:', error);
          }
        },
        onChangeText: json => {
          try {
            if (json) {
              onChange(JSON.parse(json));
            }
          } catch (error) {
            console.error('Invalid JSON:', error);
          }
        },
      };
      editorRef.current = new JSONEditor(editorContainerRef.current, options);
      isInitializedRef.current = true;
      return () => {
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      };
    }
  }, [onChange]);

  useEffect(() => {
    /**
     * Effect hook to update the JSON editor with the `initialValue` whenever it changes.
     * - Sets the editor's content to the provided `initialValue`.
     */
    if (editorRef.current && initialValue) {
      editorRef.current.set(initialValue);
    }
  }, [initialValue]);

  return <div ref={editorContainerRef} style={{ height: '400px' }} />;
});

JsonEditor.displayName = 'JsonEditor';

export default JsonEditor;
