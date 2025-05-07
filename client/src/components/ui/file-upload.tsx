import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onChange: (files: File[]) => void;
  value?: File[];
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  label?: string;
  helpText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  value = [],
  maxFiles = 5,
  maxSizeMB = 5,
  accept = "image/jpeg,image/png",
  label = "גרור לכאן תמונות או",
  helpText = `ניתן להעלות עד ${maxFiles} תמונות. פורמטים: JPG, PNG. גודל מקסימלי: ${maxSizeMB}MB לתמונה.`,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (files.length + value.length > maxFiles) {
      setErrorMessage(`ניתן להעלות עד ${maxFiles} קבצים בסך הכל`);
      return validFiles;
    }
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size
      if (file.size > maxSizeBytes) {
        setErrorMessage(`הקובץ ${file.name} גדול מדי. הגודל המקסימלי הוא ${maxSizeMB}MB`);
        continue;
      }
      
      // Check file type
      const fileType = file.type.toLowerCase();
      if (!accept.includes(fileType)) {
        setErrorMessage(`סוג קובץ לא נתמך: ${fileType}`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    return validFiles;
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = validateFiles(Array.from(e.dataTransfer.files));
      if (newFiles.length > 0) {
        onChange([...value, ...newFiles]);
        setErrorMessage(null);
      }
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = validateFiles(Array.from(e.target.files));
      if (newFiles.length > 0) {
        onChange([...value, ...newFiles]);
        setErrorMessage(null);
      }
    }
  };
  
  const handleButtonClick = () => {
    inputRef.current?.click();
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };
  
  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed ${
          dragActive ? "border-primary" : "border-neutral-light"
        } rounded-lg p-6 text-center ${
          dragActive ? "bg-primary bg-opacity-5" : ""
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <i className="fas fa-cloud-upload-alt text-3xl text-muted-foreground mb-2"></i>
        <p className="mb-2">{label}</p>
        <Button
          type="button"
          onClick={handleButtonClick}
          variant="default"
          className="bg-primary text-white"
        >
          בחר קבצים
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleChange}
          accept={accept}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground mt-2">{helpText}</p>
        {errorMessage && (
          <p className="text-sm text-destructive mt-2">{errorMessage}</p>
        )}
      </div>
      
      {value.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="font-medium">קבצים שנבחרו:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {value.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative group bg-accent rounded-md p-2"
              >
                <div className="flex items-center">
                  <i className="fas fa-file-image text-primary mr-2"></i>
                  <span className="text-sm truncate flex-1">
                    {file.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 left-1 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="fas fa-times text-destructive text-xs"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
