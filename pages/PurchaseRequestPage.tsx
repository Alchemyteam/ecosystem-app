import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import BuyerSidebar from '../components/BuyerSidebar';
import {
  Save,
  X,
  Upload,
  File,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface PurchaseRequestForm {
  target: string; // 目标/用途
  quantity: string; // 数量/范围（可模糊）
  timeRequirement: string; // 时间要求
  constraints: string; // 约束条件（合规、交付、验收等）
  attachments: File[]; // 附件
  version: number; // 版本号
  lastSaved?: string; // 最后保存时间
}

const PurchaseRequestPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState<PurchaseRequestForm>({
    target: '',
    quantity: '',
    timeRequirement: '',
    constraints: '',
    attachments: [],
    version: 1,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [versionHistory, setVersionHistory] = useState<Array<{ version: number; savedAt: string }>>([]);


  useEffect(() => {
    // TODO: 如果是编辑模式，从 API 加载数据
    if (isEditMode) {
      // 模拟加载数据
      setFormData({
        target: 'Site safety compliance equipment',
        quantity: '~50 units',
        timeRequirement: 'Q2 2024, before March 31',
        constraints: 'Must comply with local safety regulations, delivery to multiple sites required',
        attachments: [],
        version: 2,
        lastSaved: '2024-01-20T10:30:00',
      });
      setVersionHistory([
        { version: 1, savedAt: '2024-01-15T09:00:00' },
        { version: 2, savedAt: '2024-01-20T10:30:00' },
      ]);
    }
  }, [isEditMode, id]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // TODO: 调用 API 保存草稿
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟 API 调用
      
      const newVersion = formData.version + 1;
      const now = new Date().toISOString();
      setFormData((prev) => ({ ...prev, version: newVersion, lastSaved: now }));
      setVersionHistory((prev) => [...prev, { version: newVersion, savedAt: now }]);
      
      setNotification({ type: 'success', message: '草稿已保存' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: '保存失败，请重试' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.target.trim()) {
      setNotification({ type: 'error', message: '请填写目标/用途' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: 调用 API 提交 PR
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟 API 调用
      
      setNotification({ type: 'success', message: '采购请求已提交' });
      setTimeout(() => {
        navigate('/buyer/purchase-console');
      }, 1500);
    } catch (error) {
      setNotification({ type: 'error', message: '提交失败，请重试' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header />
      {notification && (
        <div
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={20} className="text-green-600" />
          ) : (
            <AlertCircle size={20} className="text-red-600" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}
      <main className="pt-20 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <BuyerSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {isEditMode ? '编辑采购请求' : '创建采购请求'}
                  </h1>
                  <p className="text-slate-600">
                    {isEditMode
                      ? '更新您的采购请求信息'
                      : '描述您的采购需求，无需指定具体产品型号'}
                  </p>
                </div>
                {formData.lastSaved && (
                  <div className="text-right">
                    <p className="text-sm text-slate-500">最后保存</p>
                    <p className="text-sm font-medium text-slate-700">
                      {new Date(formData.lastSaved).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">版本 {formData.version}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="space-y-6">
                {/* 目标/用途 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    目标/用途 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.target}
                    onChange={(e) => setFormData((prev) => ({ ...prev, target: e.target.value }))}
                    placeholder="描述您要解决的问题或采购目标（例如：需要为施工现场提供安全防护设备）"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    请用您自己的话描述需求，无需指定具体型号或品牌
                  </p>
                </div>

                {/* 数量/范围 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    数量/范围
                  </label>
                  <input
                    type="text"
                    value={formData.quantity}
                    onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                    placeholder="例如：约50单位、100-200件、待定等"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">可以填写模糊范围或"待定"</p>
                </div>

                {/* 时间要求 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    时间要求
                  </label>
                  <input
                    type="text"
                    value={formData.timeRequirement}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, timeRequirement: e.target.value }))
                    }
                    placeholder="例如：Q2 2024、3月底前、紧急等"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>

                {/* 约束条件 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    约束条件
                  </label>
                  <textarea
                    value={formData.constraints}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, constraints: e.target.value }))
                    }
                    placeholder="合规要求、交付条件、验收标准等（例如：必须符合当地安全法规、需要多地点交付、需要提供认证文件等）"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                {/* 附件上传 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    附件上传
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload className="text-slate-400 mb-2" size={32} />
                      <p className="text-sm text-slate-600 mb-1">
                        点击上传或拖拽文件到此处
                      </p>
                      <p className="text-xs text-slate-500">
                        支持规格文档、内部要求文档等
                      </p>
                    </label>
                  </div>
                  {formData.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center gap-2">
                            <File className="text-slate-400" size={18} />
                            <span className="text-sm text-slate-700">{file.name}</span>
                            <span className="text-xs text-slate-500">
                              ({(file.size / 1024).toFixed(2)} KB)
                            </span>
                          </div>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 版本历史 */}
                {versionHistory.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      版本历史
                    </label>
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                      <div className="space-y-2">
                        {versionHistory
                          .slice()
                          .reverse()
                          .map((v) => (
                            <div
                              key={v.version}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-slate-700">版本 {v.version}</span>
                              <span className="text-slate-500">
                                {new Date(v.savedAt).toLocaleString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-200">
                <button
                  onClick={() => navigate('/buyer/purchase-console')}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  取消
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        保存草稿
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.target.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        提交中...
                      </>
                    ) : (
                      '提交 PR'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchaseRequestPage;

