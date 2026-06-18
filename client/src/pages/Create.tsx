import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Video, Zap, X } from "lucide-react";
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

type CreateType = "post" | "reel" | "story" | null;

export default function Create() {
  const { user } = useAuth();
  const [createType, setCreateType] = useState<CreateType>(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPostMutation = trpc.posts.createPost.useMutation({
    onSuccess: () => {
      toast.success("Post created successfully!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create post: " + (error?.message || "Unknown error"));
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setCaption("");
    setHashtags("");
    setSelectedFile(null);
    setPreview(null);
    setCreateType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreatePost = async () => {
    if (!caption.trim()) {
      toast.error("Please add a caption");
      return;
    }

    if (!selectedFile && createType !== "story") {
      toast.error("Please select a photo or video");
      return;
    }

    // Parse hashtags
    const tags = hashtags
      .split(/\s+/)
      .filter((tag) => tag.startsWith("#"))
      .map((tag) => tag.substring(1));

    // Use preview (base64) as mediaUrl
    const mediaUrls = preview ? [preview] : [];
    const mediaKeys = selectedFile ? [selectedFile.name] : [];

    createPostMutation.mutate({
      caption: caption || "",
      hashtags: tags,
      mediaUrls,
      mediaKeys,
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create</h1>

      {/* Create Type Selection */}
      {!createType ? (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Post Card */}
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCreateType("post")}>
            <ImagePlus className="w-12 h-12 text-blue-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Post</h2>
            <p className="text-muted-foreground mb-4">Share a photo or video with your followers</p>
            <Button className="w-full">Create Post</Button>
          </Card>

          {/* Reel Card */}
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCreateType("reel")}>
            <Video className="w-12 h-12 text-purple-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Reel</h2>
            <p className="text-muted-foreground mb-4">Create a short video (up to 60 seconds)</p>
            <Button className="w-full">Create Reel</Button>
          </Card>

          {/* Story Card */}
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCreateType("story")}>
            <Zap className="w-12 h-12 text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Story</h2>
            <p className="text-muted-foreground mb-4">Share a moment that disappears in 24 hours</p>
            <Button className="w-full">Create Story</Button>
          </Card>
        </div>
      ) : (
        /* Create Form */
        <Card className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold capitalize">Create {createType}</h2>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Media Preview */}
            <div>
              <div className="bg-muted rounded-lg aspect-square flex items-center justify-center mb-4 overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <ImagePlus className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No media selected</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={createType === "reel" ? "video/*" : "image/*,video/*"}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? "Change " : "Select "} {createType === "reel" ? "Video" : "Media"}
              </Button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Caption</label>
                <Textarea
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Hashtags</label>
                <Input
                  placeholder="#example #hashtags #inqar"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Separate with spaces, start with #</p>
              </div>

              {createType === "story" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Story Info:</strong> Your story will be visible for 24 hours and then automatically deleted.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                  className="flex-1"
                >
                  {createPostMutation.isPending ? "Uploading..." : `Create ${createType}`}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
