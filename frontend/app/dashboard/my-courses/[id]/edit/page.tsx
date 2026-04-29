"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, GripVertical, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCourseById, updateCourse } from "@/store/thunks/courseThunks";
import type { UpdateCoursePayload } from "@/types/api";

const uploadToCloudinary = (file: File, preset: string, onProgress: (loaded: number, total: number) => void): Promise<string> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/dwmx37pst/${file.type.startsWith("image/") ? "image" : "video"}/upload`;

    xhr.open("POST", url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(e.loaded, e.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        reject(new Error(JSON.parse(xhr.responseText).error?.message || "Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", preset);

    xhr.send(fd);
  });
};

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedCourse, status } = useAppSelector((state) => state.courses);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState<{ current: number, total: number, percent: number } | null>(null);

  // Initialize form state
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    shortDescription: "",
    category: "",
    level: "beginner",
    language: "English",
    thumbnail: "",
    price: 0,
    tags: [],
    isPublished: false,
    sections: [],
  });

  console.log("form", formData)
  console.log("selectedCourse", selectedCourse)
  const [tagsInput, setTagsInput] = useState("");

  // Fetch data
  useEffect(() => {
    dispatch(getCourseById(courseId));

    return () => {
      import("@/store/slices/courseSlice").then(({ clearSelectedCourse: clearAction }) => {
        dispatch(clearAction());
      });
    };
  }, [dispatch, courseId]);

  // Sync data to form
  useEffect(() => {
    if (selectedCourse && selectedCourse._id === courseId) {
      setFormData({
        title: selectedCourse.title || "",
        description: selectedCourse.description || "",
        shortDescription: selectedCourse.shortDescription || "",
        category: selectedCourse.category || "",
        level: selectedCourse.level || "beginner",
        language: selectedCourse.language || "English",
        thumbnail: selectedCourse.thumbnail || "",
        price: selectedCourse.price || 0,
        tags: selectedCourse.tags || [],
        isPublished: selectedCourse.isPublished || false,
        sections: selectedCourse.sections || [],
      });
    }
  }, [selectedCourse, courseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    let parsedValue: string | number | boolean = value;
    if (type === "number") {
      parsedValue = parseFloat(value) || 0;
    } else if (type === "checkbox") {
      parsedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev: any) => ({ ...prev, [name]: parsedValue }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setFormData((prev: any) => ({
      ...prev,
      [fieldName + "File"]: file,
      [fieldName]: objectUrl
    }));
  };

  const handleTagsChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagsInput.trim().replace(/,/g, "");
      if (newTag && !formData.tags?.includes(newTag)) {
        setFormData((prev: any) => ({ ...prev, tags: [...(prev.tags || []), newTag] }));
      }
      setTagsInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev: any) => ({
      ...prev,
      tags: prev.tags?.filter((t: string) => t !== tagToRemove) || [],
    }));
  };

  // Curriculum functions
  const addSection = () => {
    setFormData((prev: any) => ({
      ...prev,
      sections: [
        ...(prev.sections || []),
        {
          title: `New Section ${(prev.sections?.length || 0) + 1}`,
          order: (prev.sections?.length || 0) + 1,
          lessons: [],
        },
      ],
    }));
  };

  const updateSection = (sectionIndex: number, title: string) => {
    setFormData((prev: any) => {
      const newSections = [...(prev.sections || [])];
      newSections[sectionIndex] = { ...newSections[sectionIndex], title };
      return { ...prev, sections: newSections };
    });
  };

  const removeSection = (sectionIndex: number) => {
    setFormData((prev: any) => {
      const newSections = [...(prev.sections || [])];
      newSections.splice(sectionIndex, 1);
      newSections.forEach((sec: any, i: number) => (sec.order = i + 1));
      return { ...prev, sections: newSections };
    });
  };

  const addLesson = (sectionIndex: number) => {
    setFormData((prev: any) => {
      const newSections = [...(prev.sections || [])];
      const newLessons = [...(newSections[sectionIndex]?.lessons || [])];

      newLessons.push({
        title: "New Lesson",
        type: "video",
        order: newLessons.length + 1,
        durationMinutes: 5,
        videoUrl: "",
        content: "",
        isPreview: false,
      });

      newSections[sectionIndex] = { ...newSections[sectionIndex], lessons: newLessons };
      return { ...prev, sections: newSections };
    });
  };

  const updateLesson = (sectionIndex: number, lessonIndex: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const newSections = [...(prev.sections || [])];
      const newLessons = [...(newSections[sectionIndex]?.lessons || [])];
      newLessons[lessonIndex] = { ...newLessons[lessonIndex], [field]: value };
      newSections[sectionIndex] = { ...newSections[sectionIndex], lessons: newLessons };
      return { ...prev, sections: newSections };
    });
  };

  const handleLessonFileUpload = (sectionIndex: number, lessonIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const videoNode = document.createElement("video");
    videoNode.preload = "metadata";
    videoNode.onloadedmetadata = () => {
      const durationMinutes = Math.ceil(videoNode.duration / 60) || 0;
      updateLesson(sectionIndex, lessonIndex, "durationMinutes", durationMinutes);
    };
    videoNode.src = objectUrl;

    setFormData((prev: any) => {
      const newSections = [...(prev.sections || [])];
      const newLessons = [...(newSections[sectionIndex]?.lessons || [])];
      newLessons[lessonIndex] = {
        ...newLessons[lessonIndex],
        videoFile: file,
        videoUrl: objectUrl
      };
      newSections[sectionIndex] = { ...newSections[sectionIndex], lessons: newLessons };
      return { ...prev, sections: newSections };
    });
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    setFormData((prev: any) => {
      const newSections = [...(prev.sections || [])];
      const newLessons = [...(newSections[sectionIndex]?.lessons || [])];
      newLessons.splice(lessonIndex, 1);
      newLessons.forEach((les: any, i: number) => (les.order = i + 1));
      newSections[sectionIndex] = { ...newSections[sectionIndex], lessons: newLessons };
      return { ...prev, sections: newSections };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsSubmitting(true);

    try {
      let finalThumbnailUrl = formData.thumbnail;
      const filesToUpload: { file: File, preset: string, onComplete: (url: string) => void }[] = [];

      if (formData.thumbnailFile) {
        filesToUpload.push({
          file: formData.thumbnailFile,
          preset: "lmsImages",
          onComplete: (url) => { finalThumbnailUrl = url; }
        });
      }

      const finalSections = (formData.sections || []).map((section: any) => ({
        ...section,
        lessons: section.lessons.map((lesson: any) => ({ ...lesson }))
      }));

      finalSections.forEach((section: any) => {
        section.lessons.forEach((lesson: any) => {
          if (lesson.videoFile) {
            filesToUpload.push({
              file: lesson.videoFile,
              preset: "lmsVid",
              onComplete: (url) => {
                lesson.videoUrl = url;
                delete lesson.videoFile;
              }
            });
          }
        });
      });

      if (filesToUpload.length > 0) {
        setUploadProgress({ current: 0, total: 100, percent: 0 });
        const totalBytes = filesToUpload.reduce((acc, curr) => acc + curr.file.size, 0);
        let loadedBytes = new Array(filesToUpload.length).fill(0);

        await Promise.all(filesToUpload.map((item, index) =>
          uploadToCloudinary(item.file, item.preset, (loaded) => {
            loadedBytes[index] = loaded;
            const totalLoaded = loadedBytes.reduce((a, b) => a + b, 0);
            setUploadProgress({
              current: totalLoaded,
              total: totalBytes,
              percent: Math.round((totalLoaded / totalBytes) * 100)
            });
          }).then(item.onComplete)
        ));
      }

      const finalPayloadData = {
        ...formData,
        thumbnail: finalThumbnailUrl,
        sections: finalSections
      };

      delete finalPayloadData.thumbnailFile;

      // Update the state so if the API call below fails, the user won't re-upload the same files again!
      setFormData(finalPayloadData);

      const payload: UpdateCoursePayload = {
        id: courseId,
        data: finalPayloadData,
      };

      await dispatch(updateCourse(payload)).unwrap();
      toast.success("Course updated successfully");
      router.push("/dashboard/my-courses");
    } catch (error: any) {
      toast.error(error.message || error || "Failed to update course");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  if (status === "loading" && !selectedCourse) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse flex space-x-2">
          <div className="w-3 h-3 bg-primary-500"></div>
          <div className="w-3 h-3 bg-primary-500 delay-75"></div>
          <div className="w-3 h-3 bg-primary-500 delay-150"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 relative">
      {/* Progress Overlay */}
      {uploadProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-50 dark:bg-surface-900 p-8 rounded-lg shadow-xl w-full max-w-md border border-surface-200 dark:border-surface-700">
            <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-4 text-center">
              Uploading Media Files...
            </h3>
            <div className="w-full bg-surface-200 dark:bg-surface-800 rounded-full h-4 mb-2 overflow-hidden">
              <div
                className="bg-primary-500 h-4 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress.percent}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-surface-500 font-medium">
              {uploadProgress.percent}% Complete
            </p>
            <p className="text-center text-xs text-surface-400 mt-2">
              Please do not close this window.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/my-courses"
          className="p-2 border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Edit Course</h1>
          <p className="text-surface-500 mt-1">Update the details for {selectedCourse?.title}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-4 mb-8">
        {[
          { num: 1, label: "Basic Info" },
          { num: 2, label: "Details & Metadata" },
          { num: 3, label: "Curriculum Builder" },
        ].map((s) => (
          <div key={s.num} className="flex flex-col md:flex-row items-center md:space-x-3 w-1/3 text-center md:text-left justify-center md:justify-start">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 md:mb-0 ${step >= s.num ? "bg-primary-500 text-white" : "bg-surface-200 dark:bg-surface-800 text-surface-500"
                }`}
            >
              {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
            </div>
            <span className={`text-sm font-medium ${step >= s.num ? "text-surface-900 dark:text-white" : "text-surface-500 hidden md:block"}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-surface-900 dark:text-white border-b border-surface-200 dark:border-surface-700 pb-4">
              Basic Course Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-surface-300 dark:border-surface-700 dark:bg-background focus:ring-2 focus:ring-primary-500 rounded-none"
                  placeholder="e.g. JavaScript for Beginners: The Complete Guide"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-surface-300 dark:border-surface-700 dark:bg-background focus:ring-2 focus:ring-primary-500 rounded-none"
                    placeholder="e.g. Web Development"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-surface-300 dark:border-surface-700 dark:bg-background focus:ring-2 focus:ring-primary-500 rounded-none"
                    placeholder="29.99"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Level
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-surface-300 dark:border-surface-700 dark:bg-background focus:ring-2 focus:ring-primary-500 rounded-none capitalize"
                  >
                    <option value="beginner" className="bg-white dark:bg-surface-950 text-surface-900 dark:text-white">Beginner</option>
                    <option value="intermediate" className="bg-white dark:bg-surface-950 text-surface-900 dark:text-white">Intermediate</option>
                    <option value="advanced" className="bg-white dark:bg-surface-950 text-surface-900 dark:text-white">Advanced</option>
                    <option value="expert" className="bg-white dark:bg-surface-950 text-surface-900 dark:text-white">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Language
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-surface-300 dark:border-surface-700 dark:bg-background focus:ring-2 focus:ring-primary-500 rounded-none capitalize"
                  >
                    <option value="English" className="bg-white dark:bg-surface-950 text-surface-900 dark:text-white">English</option>
                    <option value="Arabic" className="bg-white dark:bg-surface-950 text-surface-900 dark:text-white">Arabic</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-surface-900 dark:text-white border-b border-surface-200 dark:border-surface-700 pb-4">
              Details & Metadata
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Thumbnail Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  name="thumbnail"
                  onChange={(e) => handleFileUpload(e, "thumbnail")}
                  className="w-full px-4 py-2 border border-surface-300 dark:border-surface-700 dark:bg-background focus:ring-2 focus:ring-primary-500 rounded-none file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600"
                />
                {formData.thumbnail && formData.thumbnail.startsWith("blob:") && (
                  <div className="mt-2 text-sm text-green-500">New image selected.</div>
                )}
                {formData.thumbnail && !formData.thumbnail.startsWith("blob:") && formData.thumbnail.length > 0 && (
                  <div className="mt-2 text-sm text-surface-500">Current image URL: {formData.thumbnail}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-surface-300 dark:border-surface-700 dark:bg-background focus:ring-2 focus:ring-primary-500 rounded-none"
                  placeholder="A quick 1-2 sentence summary of the course."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Full Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-surface-300 dark:border-surface-700 dark:bg-background focus:ring-2 focus:ring-primary-500 rounded-none resize-y"
                  placeholder="Detailed explanation of what students will learn..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Tags
                </label>
                <div className="border border-surface-300 dark:border-surface-700 dark:bg-background p-2 flex flex-wrap gap-2">
                  {formData.tags?.map((tag: string) => (
                    <span key={tag} className="flex items-center bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 px-2 py-1 text-sm">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-surface-500 hover:text-red-500">
                        &times;
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    onKeyDown={handleTagsChange}
                    className="flex-grow min-w-[120px] focus:outline-none bg-transparent"
                    placeholder="Type a tag and press Enter"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-surface-200 dark:border-surface-700">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-500 dark:bg-background border-surface-300 dark:border-surface-700 focus:ring-2 focus:ring-primary-500 rounded-none"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  Publish immediately (available to students instantly)
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-surface-200 dark:border-surface-700 pb-4">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                Curriculum Builder
              </h2>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center text-sm bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Section
              </button>
            </div>

            <div className="space-y-6">
              {formData.sections?.map((section: any, sIdx: number) => (
                <div key={sIdx} className="border border-surface-300 dark:border-surface-700 dark:bg-background">
                  <div className="bg-surface-100 dark:bg-surface-800 p-3 flex justify-between items-center border-b border-surface-300 dark:border-surface-700">
                    <div className="flex items-center flex-grow space-x-3">
                      <GripVertical className="text-surface-400 w-5 h-5 cursor-grab" />
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(sIdx, e.target.value)}
                        className="font-bold bg-transparent border-none focus:ring-0 p-0 text-surface-900 dark:text-white w-full"
                      />
                    </div>
                    <button type="button" onClick={() => removeSection(sIdx)} className="text-red-500 hover:text-red-600 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    {section.lessons.map((lesson: any, lIdx: number) => (
                      <div key={lIdx} className="border border-surface-200 dark:border-surface-700 p-4 relative group">
                        <button
                          type="button"
                          onClick={() => removeLesson(sIdx, lIdx)}
                          className="absolute right-2 top-2 text-surface-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex gap-4">
                            <div className="w-2/3">
                              <label className="block text-xs font-medium text-surface-500 mb-1">Lesson Title</label>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => updateLesson(sIdx, lIdx, "title", e.target.value)}
                                className="w-full text-sm px-3 py-1.5 border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-background"
                              />
                            </div>
                            <div className="w-1/3">
                              <label className="block text-xs font-medium text-surface-500 mb-1">Duration (min)</label>
                              <input
                                type="number"
                                value={lesson.durationMinutes}
                                onChange={(e) => updateLesson(sIdx, lIdx, "durationMinutes", parseInt(e.target.value) || 0)}
                                className="w-full text-sm px-3 py-1.5 border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-background"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-surface-500 mb-1">
                              Upload Video
                            </label>
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => handleLessonFileUpload(sIdx, lIdx, e)}
                                className="w-full text-sm px-3 py-1.5 border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-background file:mr-4 file:py-1 file:px-3 file:border-0 file:text-xs file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600"
                              />
                              {lesson.videoUrl && lesson.videoUrl.startsWith("blob:") && (
                                <div className="text-xs text-green-500">New video selected.</div>
                              )}
                              {lesson.videoUrl && !lesson.videoUrl.startsWith("blob:") && lesson.videoUrl.length > 0 && (
                                <div className="text-xs text-surface-500">Current video URL: {lesson.videoUrl}</div>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-surface-500 mb-1">
                              Content
                            </label>
                            <textarea
                              value={lesson.content || ""}
                              onChange={(e) => updateLesson(sIdx, lIdx, "content", e.target.value)}
                              rows={3}
                              className="w-full text-sm px-3 py-1.5 border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-background"
                            />
                          </div>
                          <div className="flex items-center mt-2">
                            <input
                              type="checkbox"
                              checked={lesson.isPreview || false}
                              onChange={(e) => updateLesson(sIdx, lIdx, "isPreview", e.target.checked)}
                              className="w-4 h-4 text-primary-500 border-surface-300 focus:ring-primary-500"
                            />
                            <label className="ml-2 text-xs font-medium text-surface-600 dark:text-surface-400">
                              Make this lesson available as a free preview
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addLesson(sIdx)}
                      className="text-sm font-medium text-primary-500 hover:text-primary-600 flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Lesson
                    </button>
                  </div>
                </div>
              ))}

              {(!formData.sections || formData.sections.length === 0) && (
                <div className="text-center py-10 border-2 border-dashed border-surface-300 dark:border-surface-700 text-surface-500">
                  <p>No sections added yet.</p>
                  <p className="text-sm mt-1">Start building your curriculum by adding a section above.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || isSubmitting}
            className="px-6 py-2 border border-surface-300 dark:border-surface-700 text-surface-700 dark:text-surface-300 font-medium hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : step === 3 ? "Save Changes" : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
