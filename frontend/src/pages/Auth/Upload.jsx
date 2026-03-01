import { useState, useEffect, useRef } from "react";
import API from "../../api/axios";
import Navbar from "../../components/Navbar";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const [videos, setVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  const pollingRef = useRef(null);

  const selectedVideo = videos.find((v) => v.id === selectedVideoId) || null;
  const handleDownload = async (fileUrl, filename) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const startPolling = (videoId) => {
    stopPolling();

    pollingRef.current = setInterval(async () => {
      try {
        const { data } = await API.get(`/video/${videoId}`);

        setVideos((prev) => {
          const exists = prev.some((v) => v.id === data.id);
          if (!exists) {
            return [data, ...prev];
          }
          return prev.map((v) => (v.id === data.id ? { ...v, ...data } : v));
        });

        if (data.status === "completed") {
          stopPolling();
        }
      } catch (error) {
        console.error("Failed to poll video status", error);
      }
    }, 3000);
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data } = await API.get("/video");
        const list = Array.isArray(data) ? data : [];
        setVideos(list);
        if (!selectedVideoId && list.length > 0) {
          setSelectedVideoId(list[0].id);
        }
      } catch (error) {
        console.error("Failed to load videos", error);
      }
    };

    fetchVideos();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      stopPolling();
    },
    []
  );

  const getVideoTitle = (video) => {
    if (!video) return "";
    if (video.url) {
      try {
        const urlObj = new URL(video.url);
        const parts = urlObj.pathname.split("/");
        const last = parts[parts.length - 1] || "";
        if (last) {
          return decodeURIComponent(last);
        }
      } catch {
        const raw = video.url.split("?")[0];
        const last = raw.split("/").pop();
        if (last) return last;
      }
    }
    return `Video ${video.id}`;
  };

  const handleSelectVideo = (video) => {
    setSelectedVideoId(video.id);
    if (video.status === "pending") {
      startPolling(video.id);
    } else {
      stopPolling();
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a video first");

    try {
      setLoading(true);
      setProgress(0);

      const { data } = await API.post("/video/generate-upload-url", {
        fileName: file.name,
        fileType: file.type,
      });

      const uploadUrl = data?.url;
      if (!uploadUrl) {
        throw new Error("No upload URL received");
      }

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded * 100) / event.total);
            setProgress(percent);
          }
        };

        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error("S3 upload failed"));
        xhr.onerror = () => reject(new Error("Network error during upload"));

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      const cleanUrl = uploadUrl.split("?")[0];
      const saveRes = await API.post("/video/save-video", { url: cleanUrl });
      const savedVideo = saveRes.data;

      const normalized = {
        ...savedVideo,
        reelUrls: Array.isArray(savedVideo.reelUrls)
          ? savedVideo.reelUrls
          : [],
      };

      setVideos((prev) => [normalized, ...prev]);
      setSelectedVideoId(savedVideo.id);
      startPolling(savedVideo.id);

      alert("Upload successful 🎉");
      setFile(null);
      setProgress(0);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Upload failed";
      alert(`Upload failed ❌ ${typeof message === "string" ? message : ""}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-neutral-800 flex gap-x-2">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-72 flex-col border-r rounded-r-2xl border-[#0F5F5C] bg-[#050B10]">
          <div className="px-4 py-4 border-b border-[#0F5F5C]">
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setProgress(0);
              }}
              className="w-full rounded-lg bg-[#220878] hover:bg-[#3FA66B] text-white text-sm font-semibold py-3 px-3 flex items-center justify-center gap-2 transition"
            >
              <span className="text-lg">＋</span>
              <span>New upload</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
            {videos.length === 0 ? (
              <p className="text-xs text-[#72868F] px-2">
                No uploads yet. Upload a video to start.
              </p>
            ) : (
              videos.map((video) => {
                const isActive = video.id === selectedVideoId;
                const statusText =
                  video.status === "completed"
                    ? "Completed"
                    : video.status === "pending"
                      ? "Processing"
                      : video.status;

                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => handleSelectVideo(video)}
                    className={`w-full text-left rounded-lg px-3 py-3 text-sm transition flex flex-col gap-1 ${isActive
                        ? "bg-[#0F5F5C] border border-[#3FA66B]"
                        : "hover:bg-[#0F5F5C]/70"
                      }`}
                  >
                    <span className="font-medium text-white truncate">
                      {getVideoTitle(video)}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide text-[#BEE6D5]">
                      {statusText}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Main area */}
        <main className="bg-[#0C1C26] rounded-l-2xl flex-1 flex flex-col items-center justify-center px-4 py-6">
          <div className="w-full max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Upload a video to create reels
            </h2>
            <p className="text-sm text-[#BEE6D5] mb-6">
              Drag & drop your file below, or browse from your computer. Each
              upload creates a new chat on the left.
            </p>

            <div className="bg-white/5 backdrop-blur-xl border border-[#0F5F5C] rounded-2xl shadow-2xl p-6 md:p-8">
              {/* Drag & Drop */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition ${dragActive
                    ? "border-[#3FA66B] bg-[#0F5F5C]/30"
                    : "border-[#0F5F5C]"
                  }`}
              >
                {file ? (
                  <p className="text-[#BEE6D5] font-medium">{file.name}</p>
                ) : (
                  <p className="text-[#BEE6D5]">
                    Drop video here or click below
                  </p>
                )}
              </div>

              <input
                type="file"
                accept="video/*"
                className="hidden"
                id="fileInput"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />

              <label
                htmlFor="fileInput"
                className="block text-center mt-4 text-[#3FA66B] font-semibold cursor-pointer hover:underline"
              >
                Browse File
              </label>

              {/* Progress */}
              {progress > 0 && (
                <div className="mt-6">
                  <div className="w-full bg-[#0F5F5C] rounded-full h-3">
                    <div
                      className="bg-[#3FA66B] h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-center text-sm text-[#BEE6D5] mt-2">
                    {progress}% Uploaded
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="w-full mt-6 py-3 rounded-lg bg-[#220878] hover:bg-[#3FA66B] disabled:opacity-70 text-white font-semibold transition duration-300 shadow-lg"
              >
                {loading ? "Uploading..." : "Upload Video"}
              </button>
            </div>
          </div>

          {selectedVideo && (
            <div className="w-full max-w-2xl mt-10">
              <div className="bg-white/5 border border-[#0F5F5C] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <div>
                    <p className="text-sm text-[#BEE6D5] mb-1">
                      Current chat
                    </p>
                    <h3 className="text-lg font-semibold text-white">
                      {getVideoTitle(selectedVideo)}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedVideo.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-yellow-500/20 text-yellow-200"
                      }`}
                  >
                    {selectedVideo.status === "completed"
                      ? "Completed"
                      : "Processing"}
                  </span>
                </div>

                {selectedVideo.status === "pending" && (
                  <div className="flex items-center gap-4 py-4">
                    <div className="w-8 h-8 border-2 border-[#3FA66B] border-t-transparent rounded-full animate-spin" />
                    <div>
                      <p className="text-white font-semibold">
                        Processing video...
                      </p>
                      <p className="text-sm text-[#BEE6D5]">
                        We&apos;re generating smart reels. This can take a few
                        minutes depending on video length.
                      </p>
                    </div>
                  </div>
                )}

                {selectedVideo.status === "completed" && (
                  <div className="space-y-4">
                    <p className="text-sm text-[#BEE6D5]">
                      Your reels are ready. Click any reel below to open it from
                      S3.
                    </p>

                    {selectedVideo.reelUrls &&
                      selectedVideo.reelUrls.length > 0 ? (
                      <ul className="space-y-3">
                        {selectedVideo.reelUrls.map((url, index) => (
                          <li
                            key={url || index}
                            className="flex items-center justify-between bg-black/30 rounded-lg px-4 py-3"
                          >
                            <div className="mr-3">
                              <p className="text-white font-semibold">
                                Reel #{index + 1}
                              </p>
                              <p className="text-xs text-[#BEE6D5] break-all">
                                {url}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-2 rounded-md bg-[#3FA66B] hover:bg-[#45c177] text-xs font-semibold text-white whitespace-nowrap"
                              >
                                Open
                              </a>
                              <a
                                
                                target="_blank"
                                onClick={() => handleDownload(url,`reel-${selectedVideo.id}-${index + 1}.mp4`)}
                              className="px-3 py-2 rounded-md bg-[#220878] hover:bg-[#3FA66B] text-xs font-semibold text-white whitespace-nowrap"
                              >
                              Download
                            </a>
                          </div>
                          </li>
                    ))}
                  </ul>
                ) : (
                <p className="text-sm text-[#BEE6D5]">
                  No reels generated yet for this video.
                </p>
                    )}
              </div>
                )}
            </div>
            </div>
          )}
    </main >
      </div >
    </>
  );
};

export default Upload;

