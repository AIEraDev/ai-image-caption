"use client";

import type React from "react";

import { useState } from "react";
import { Upload, Sparkles, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = "AIzaSyCcpgqrTKOnlbNHeoyQzkQ5O7z1WXPRoD0";
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

export default function ImageCaptionViewer() {
  const [caption, setCaption] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageString = event.target?.result as string;
        setPreviewImage(imageString);
        setSelectedImage(imageString.replace(/^data:.+;base64,/, ""));
        setFileType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  //
  const generateCaption = async () => {
    setIsGenerating(true);

    console.log(selectedImage);

    const contents = [
      {
        inlineData: {
          mimeType: fileType,
          data: selectedImage as string,
        },
      },
      { text: "Caption this image." },
    ];

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
      });

      console.log(response);

      if (response.text) {
        setCaption(response.text);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-accent" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground">AI Image Caption Viewer</h1>
          </div>
          <p className="text-muted-foreground text-lg">Upload an image and let AI describe what it sees</p>
        </div>

        {/* Main Content */}
        <Card className="p-8 space-y-6">
          {!selectedImage ? (
            <label className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent transition-colors">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-foreground">Click to upload an image</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, or WEBP up to 10MB</p>
                </div>
              </div>
            </label>
          ) : (
            <div className="space-y-6">
              {/* Image Display */}
              <div className="relative rounded-lg overflow-hidden bg-muted">
                <img src={previewImage || "/placeholder.svg"} alt="Uploaded" className="w-full h-auto max-h-[500px] object-contain" />
              </div>

              {/* Caption Display */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-semibold text-foreground">AI Generated Caption</h2>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 min-h-[80px] flex items-center">
                  {isGenerating ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span className="text-sm">Analyzing image...</span>
                    </div>
                  ) : (
                    <p className="text-foreground leading-relaxed">{caption}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setSelectedImage(null);
                    setCaption("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Upload New Image
                </Button>
                <Button onClick={generateCaption} disabled={isGenerating} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Regenerate Caption
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">Powered by AI • Simple and elegant image captioning</p>
      </div>
    </main>
  );
}
