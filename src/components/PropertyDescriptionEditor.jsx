import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const PropertyDescriptionEditor = ({ value, onChange, placeholder, error }) => {
  
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [2, 3, false] }],
      ['bold', 'italic'],
      [{ 'list': 'bullet' }],
      ['clean']
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic',
    'list', 'bullet'
  ];

  // Calculate character count (stripping HTML tags)
  const plainText = value ? value.replace(/<[^>]*>/g, '').trim() : '';
  const charCount = plainText.length;
  const minChars = 50;
  const isValid = charCount >= minChars;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-end">
        <label className="block text-sm font-medium text-gray-700">
          Descrição do Imóvel <span className="text-red-500">*</span>
        </label>
        <span className={`text-xs font-medium ${isValid ? 'text-green-600' : 'text-gray-400'}`}>
          {charCount} / {minChars} caracteres
        </span>
      </div>
      
      <div className={`bg-white rounded-md border overflow-hidden transition-colors ${error ? 'border-red-500' : 'border-gray-300 focus-within:border-gray-400'}`}>
        <ReactQuill
          theme="snow"
          value={value || ''}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder || "Descreva os detalhes do imóvel..."}
          className="property-description-editor"
        />
      </div>
      
      <div className="flex justify-between items-start">
        <p className="text-xs text-gray-500">
          Use títulos e listas para melhorar a legibilidade e o SEO.
        </p>
        {!isValid && charCount > 0 && (
          <p className="text-xs text-red-500 font-medium">
            Mínimo de 50 caracteres necessários.
          </p>
        )}
      </div>
    </div>
  );
};

export default PropertyDescriptionEditor;