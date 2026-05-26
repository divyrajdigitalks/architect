"use client";

import { useState } from "react";
import { Camera, X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { officeTaskService } from "@/services/officeTask.service";
import { siteTaskService } from "@/services/siteTask.service";

interface TaskImageUploadProps {
  taskId: string;
  type: "Office" | "Site";
  onUploadComplete: () => void;
  existingImages?: string[];
}

export function TaskImageUpload({ taskId, type, onUploadComplete, existingImages = [] }: TaskImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      if (type === "Office") {
        await officeTaskService.uploadImages(taskId, selectedFiles);
      } else {
        await siteTaskService.uploadImages(taskId, selectedFiles);
      }
      setSelectedFiles([]);
      setPreviews([]);
      onUploadComplete();
    } catch (error) {
      console.error("Failed to upload images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {existingImages.map((url, i) => (
          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
            <img src={url} alt={`Task ${i}`} className="w-full h-full object-cover" />
          </div>
        ))}
        
        {previews.map((url, i) => (
          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-indigo-200 bg-indigo-50">
            <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover opacity-60" />
            <button 
              onClick={() => removeFile(i)}
              className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl-lg"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <label className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all">
          <Camera className="w-5 h-5 text-slate-400" />
          <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <Button 
          onClick={handleUpload} 
          disabled={isUploading}
          className="w-full h-9 rounded-xl text-xs gap-2"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {isUploading ? "Uploading..." : `Upload ${selectedFiles.length} Files`}
        </Button>
      )}
    </div>
  );
}
