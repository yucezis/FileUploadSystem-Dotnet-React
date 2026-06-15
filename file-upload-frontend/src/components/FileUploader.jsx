// src/components/FileUploader.jsx
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File as FileIcon, CheckCircle2, AlertCircle, X } from "lucide-react";
import api from "../services/api";

export default function FileUploader({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle, uploading, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  // Sürükle-bırak olayları
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setProgress(0);
    setStatus("idle");
    setErrorMessage("");
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setProgress(0);
    setStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    setStatus("uploading");
    setProgress(0);

    const chunkSize = 5 * 1024 * 1024; // Her parça 5 MB
    const totalChunks = Math.ceil(selectedFile.size / chunkSize);
    const uploadId = crypto.randomUUID(); // Bu dosyaya özel benzersiz kimlik

    try {
      for (let chunkIndex = 1; chunkIndex <= totalChunks; chunkIndex++) {
        // Dosyadan ilgili 5MB'lık parçayı kesiyoruz
        const start = (chunkIndex - 1) * chunkSize;
        const end = Math.min(start + chunkSize, selectedFile.size);
        const chunkBlob = selectedFile.slice(start, end);

        // Backend'in beklediği ChunkUploadRequest DTO'suna uygun FormData hazırlıyoruz
        const formData = new FormData();
        formData.append("File", chunkBlob, selectedFile.name);
        formData.append("FileName", selectedFile.name);
        formData.append("UploadId", uploadId);
        formData.append("ChunkIndex", chunkIndex);
        formData.append("TotalChunks", totalChunks);
        formData.append("TotalFileSize", selectedFile.size);

        // Parçayı MinIO/Backend'e gönderiyoruz
        await api.post("/document/chunked-upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // İlerlemeyi güncelle
        const currentProgress = Math.round((chunkIndex / totalChunks) * 100);
        setProgress(currentProgress);
      }

      setStatus("success");

      if (onUploadSuccess) {
        onUploadSuccess({
          id: crypto.randomUUID(), // Benzersiz ID (API'den gelene kadar geçici)
          name: selectedFile.name,
          size: (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB",
          uploadDate: new Date().toLocaleDateString("tr-TR", { day: '2-digit', month: 'short', year: 'numeric' })
        });
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage("Yükleme sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto" style={{ fontFamily: "var(--font-family)" }}>
      <div
        className={`relative border-2 border-dashed rounded-3xl p-10 transition-all duration-300 ${
          isDragging
            ? "border-[#c45fa0] bg-[rgba(196,95,160,0.05)] scale-[1.02]"
            : "border-[#b0a0b8] bg-[rgba(255,255,255,0.6)] hover:border-[#7ba7e8]"
        }`}
        style={{ backdropFilter: "blur(12px)" }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.div
              key="upload-prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center text-center gap-4 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ background: "linear-gradient(135deg, rgba(196,95,160,0.1), rgba(123,167,232,0.1))" }}
              >
                <UploadCloud size={32} style={{ color: "#c45fa0" }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: "1.1rem", color: "#1e1028" }}>
                  Dosyanızı buraya sürükleyin
                </p>
                <p style={{ color: "#8a6b85", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                  veya seçmek için tıklayın
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="file-info"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-5"
            >
              {/* Dosya Bilgisi Kartı */}
              <div className="flex items-center justify-between bg-white/80 p-4 rounded-2xl border border-white/40 shadow-sm">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="p-3 bg-[#eef3fe] rounded-xl text-[#7ba7e8]">
                    <FileIcon size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate font-semibold text-[#1e1028]">{selectedFile.name}</p>
                    <p className="text-xs text-[#8a6b85]">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {status !== "uploading" && status !== "success" && (
                  <button onClick={clearSelection} className="p-2 text-[#8a6b85] hover:text-[#d4183d] transition-colors">
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* İlerleme Çubuğu (Progress Bar) */}
              {(status === "uploading" || status === "success") && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm font-medium text-[#5a4060]">
                    <span>{status === "success" ? "Yükleme Tamamlandı" : "Yükleniyor..."}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#f5e9f3] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #c45fa0, #7ba7e8)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Hata Mesajı */}
              {status === "error" && (
                <div className="flex items-center gap-2 text-[#d4183d] bg-[#fdf4f8] p-3 rounded-xl border border-[#d4183d]/20 text-sm font-medium">
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Yükle Butonu */}
              {status === "idle" && (
                <motion.button
                  onClick={uploadFile}
                  className="w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #c45fa0 0%, #7ba7e8 100%)",
                    boxShadow: "0 4px 20px rgba(196,95,160,0.3)",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UploadCloud size={18} />
                  Buluta Yükle
                </motion.button>
              )}

              {/* Başarı Durumu */}
              {status === "success" && (
                <motion.button
                  onClick={clearSelection}
                  className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 border-2 border-[#7ba7e8] text-[#7ba7e8] bg-white/50"
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,1)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle2 size={18} />
                  Yeni Dosya Yükle
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}