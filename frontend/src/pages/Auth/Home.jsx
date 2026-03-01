import { useState } from "react";
import API from "../../api/axios";
import Navbar from "../../components/Navbar";

const Home = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

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

        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("S3 upload failed")));
        xhr.onerror = () => reject(new Error("Network error during upload"));

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      const cleanUrl = uploadUrl.split("?")[0];
      await API.post("/video/save-video", { url: cleanUrl });

      alert("Upload successful 🎉");
      setFile(null);
      setProgress(0);
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message || "Upload failed";
      alert(`Upload failed ❌ ${typeof message === "string" ? message : ""}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#0C1C26] flex items-center justify-center px-4">
        <div className="w-full max-w-xl bg-white/5 backdrop-blur-xl border border-[#0F5F5C] p-10 rounded-2xl shadow-2xl">
          <h2 className="text-3xl font-bold text-white text-center mb-3">
            Upload Video
          </h2>

          <p className="text-center text-[#BEE6D5] mb-8">
            Drag & drop your file below
          </p>

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
              setFile(e.dataTransfer.files[0]);
            }}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition ${
              dragActive
                ? "border-[#3FA66B] bg-[#0F5F5C]/30"
                : "border-[#0F5F5C]"
            }`}
          >
            {file ? (
              <p className="text-[#BEE6D5] font-medium">{file.name}</p>
            ) : (
              <p className="text-[#BEE6D5]">Drop video here or click below</p>
            )}
          </div>

          <input
            type="file"
            accept="video/*"
            className="hidden"
            id="fileInput"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <label
            htmlFor="fileInput"
            className="block text-center mt-6 text-[#3FA66B] font-semibold cursor-pointer hover:underline"
          >
            Browse File
          </label>

          {/* Progress */}
          {progress > 0 && (
            <div className="mt-8">
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
            onClick={handleUpload}
            disabled={loading}
            className="w-full mt-8 py-3 rounded-lg bg-[#220878] hover:bg-[#3FA66B] text-white font-semibold transition duration-300 shadow-lg"
          >
            {loading ? "Uploading..." : "Upload Video"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
