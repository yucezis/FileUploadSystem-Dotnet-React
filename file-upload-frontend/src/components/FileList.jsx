import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Image as ImageIcon, Archive, Music, Video, File, Trash2, Download } from "lucide-react";

const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  switch (extension) {
    case 'pdf': case 'doc': case 'docx': case 'txt':
      return { icon: <FileText size={20} />, color: "text-blue-500", bg: "bg-blue-100" };
    case 'jpg': case 'jpeg': case 'png': case 'gif':
      return { icon: <ImageIcon size={20} />, color: "text-pink-500", bg: "bg-pink-100" };
    case 'zip': case 'rar':
      return { icon: <Archive size={20} />, color: "text-purple-500", bg: "bg-purple-100" };
    case 'mp3': case 'wav':
      return { icon: <Music size={20} />, color: "text-emerald-500", bg: "bg-emerald-100" };
    case 'mp4': case 'avi':
      return { icon: <Video size={20} />, color: "text-orange-500", bg: "bg-orange-100" };
    default:
      return { icon: <File size={20} />, color: "text-gray-500", bg: "bg-gray-100" };
  }
};

export default function FileList({ files, onDelete, onDownload }) { 
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full" style={{ fontFamily: "var(--font-family)" }}>
      <div 
        className="rounded-3xl p-6 md:p-8 border"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(24px)",
          borderColor: "rgba(255,255,255,0.5)",
          boxShadow: "0 10px 40px rgba(196,95,160,0.08)"
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 style={{ fontWeight: 700, fontSize: "1.4rem", color: "#1e1028" }}>Dosyalarım</h2>
            <p style={{ color: "#8a6b85", fontSize: "0.9rem" }}>Toplam {files.length} dosya</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#c45fa0" }} />
            <input
              type="text"
              placeholder="Dosya ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.8)", borderColor: "rgba(196,95,160,0.2)", color: "#1e1028", fontSize: "0.9rem" }}
              onFocus={(e) => (e.target.style.borderColor = "#c45fa0")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(196,95,160,0.2)")}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(196,95,160,0.1)" }}>
                <th className="pb-3 font-semibold text-sm" style={{ color: "#5a4060" }}>Dosya Adı</th>
                <th className="pb-3 font-semibold text-sm" style={{ color: "#5a4060" }}>Boyut</th>
                <th className="pb-3 font-semibold text-sm" style={{ color: "#5a4060" }}>Yükleme Tarihi</th>
                <th className="pb-3 font-semibold text-sm text-right" style={{ color: "#5a4060" }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => {
                    const { icon, color, bg } = getFileIcon(file.name);
                    return (
                      <motion.tr 
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="group"
                        style={{ borderBottom: "1px solid rgba(196,95,160,0.05)" }}
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${color}`}>{icon}</div>
                            <span className="font-medium text-[0.95rem]" style={{ color: "#1e1028" }}>{file.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm" style={{ color: "#8a6b85" }}>{file.size}</td>
                        <td className="py-4 text-sm" style={{ color: "#8a6b85" }}>{file.uploadDate}</td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => onDownload(file.id, file.name)} 
                                className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" 
                                title="İndir">
                                <Download size={18} />
                            </button>
                            <button 
                              onClick={() => onDelete(file.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors" 
                              title="Sil"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center" style={{ color: "#8a6b85" }}>
                      Henüz hiç dosya yüklemediniz veya aranan dosya bulunamadı.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}