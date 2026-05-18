// import { useState } from "react";

// export default function SceneAndBrief({ onNext, onBack }) {
//   const [sceneCount, setSceneCount] = useState(3);
//   const [briefs, setBriefs] = useState(["", "", ""]);

//   const maxScenes = 10;
//   const minScenes = 1;
//   const maxChars = 500;

//   const handleDecrease = () => {
//     setSceneCount((prev) => Math.max(minScenes, prev - 1));
//   };

//   const handleIncrease = () => {
//     setSceneCount((prev) => {
//       const next = Math.min(maxScenes, prev + 1);

//       setBriefs((current) => {
//         const updated = [...current];
//         while (updated.length < next) updated.push("");
//         return updated;
//       });

//       return next;
//     });
//   };

//   const handleSceneCountChange = (event) => {
//     let value = Number(event.target.value);

//     if (Number.isNaN(value)) value = minScenes;

//     value = Math.max(minScenes, Math.min(maxScenes, value));

//     setSceneCount(value);

//     setBriefs((current) => {
//       const updated = [...current];

//       while (updated.length < value) updated.push("");

//       return updated.slice(0, value);
//     });
//   };

//   const handleBriefChange = (index, value) => {
//     const limitedValue = value.slice(0, maxChars);

//     setBriefs((current) => {
//       const updated = [...current];
//       updated[index] = limitedValue;
//       return updated;
//     });
//   };

// //   const getPlaceholder = (index) => {
// //     const placeholders = [
// //       "Để brief chất lượng thì bạn nên mô tả bối cảnh và trạng thái ban đầu của nhân vật (ở đâu hoặc làm gì), sau đó bạn mới mô tả hành động của nhân vật. Ví dụ: 'Background kệ sản phẩm có 4 tầng, tầng 1:súp thưởng Silver Spoon,... . Lúc này chưa có con mèo . Sau 1s Mèo ragdoll đi bằng 2 chân mang tạp dề màu xanh, kéo thùng đồ có logo Silver Spoon từ ngoài khung hình vào gần kệ tủ'",
// //       "Describe the next action or visual. e.g., 'Close up of a character's hand interacting with a holographic interface.'",
// //       "Describe the concluding shot or transition. e.g., 'Camera pans up to the sky as a large starship passes overhead, fade to logo.'",
// //     ];

// //     return (
// //       placeholders[index] ||
// //       `Describe scene ${index + 1}. Include camera angle, action, mood, characters, environment, and visual style.`
// //     );
// //   };
//   const getPlaceholder = () => {
//     return "Để brief chất lượng thì bạn nên mô tả bối cảnh và trạng thái ban đầu của nhân vật (ở đâu hoặc làm gì), sau đó bạn mới mô tả hành động của nhân vật. Ví dụ: 'Background kệ sản phẩm có 4 tầng, tầng 1:súp thưởng Silver Spoon,... . Lúc này chưa có con mèo . Sau 1s Mèo ragdoll đi bằng 2 chân mang tạp dề màu xanh, kéo thùng đồ có logo Silver Spoon từ ngoài khung hình vào gần kệ tủ'";
//   };
//   const handleNext = () => {
//     if (typeof onNext === "function") {
//       onNext({
//         sceneCount,
//         briefs: briefs.slice(0, sceneCount),
//       });
//     }
//   };

//   return (
//     <div className="flex flex-col gap-8">
//       <div className="glass-panel py-6 rounded-xl flex flex-row items-center justify-center gap-4 min-h-64">
//         <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-24 scroll-smooth">
//           <div className="max-w-6xl mx-auto h-full flex flex-col lg:flex-row gap-8 lg:gap-12 pt-6">
//             {/* Left Column: Instructions & Configuration */}
//             <section className="lg:w-1/3 flex flex-col gap-8">
//               <div className="space-y-4">
//                 <h1 className="text-3xl font-bold text-cyber-textStrong tracking-tight">
//                   Scene &amp; Brief
//                 </h1>

//                 <p className="text-cyber-text text-base leading-relaxed">
//                   Xác định cấu trúc cho dự án video của bạn. 
//                   Đặt tổng số cảnh và cung cấp ý tưởng cụ thể cho từng phân cảnh để tôi định hướng quá trình tạo nội dung.
//                 </p>
//               </div>

//               {/* Scene Counter Control */}
//               <div className="cyber-glass rounded-2xl p-6 relative overflow-hidden group">
//                 <div className="absolute -inset-px bg-gradient-to-r from-cyber-accent to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-500 blur-sm" />

//                 <div className="relative z-10">
//                   <label
//                     className="text-sm font-medium text-cyber-textStrong mb-4 flex items-center"
//                     htmlFor="scene-count"
//                   >
//                     <svg
//                       className="w-5 h-5 mr-2 text-cyber-accent"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       aria-hidden="true"
//                     >
//                       <path
//                         d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                       />
//                     </svg>
//                     Số luợng scene
//                   </label>

//                   <div className="flex items-center justify-between bg-cyber-bg border border-cyber-border rounded-xl p-2">
//                     <button
//                       aria-label="Decrease scenes"
//                       className="w-10 h-10 rounded-lg flex items-center justify-center text-cyber-text hover:bg-cyber-surface hover:text-white transition-colors border border-transparent hover:border-cyber-border focus:outline-none focus:ring-2 focus:ring-cyber-accent disabled:opacity-40 disabled:cursor-not-allowed"
//                       type="button"
//                       onClick={handleDecrease}
//                       disabled={sceneCount <= minScenes}
//                     >
//                       <svg
//                         className="w-5 h-5"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                         aria-hidden="true"
//                       >
//                         <path
//                           d="M20 12H4"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                         />
//                       </svg>
//                     </button>

//                     <div className="flex-1 flex justify-center">
//                       <input
//                         className="w-16 bg-transparent border-none text-center text-2xl font-bold
//                                     text-cyber-textStrong focus:ring-0 p-0 m-0
//                                     appearance-none
//                                     [&::-webkit-outer-spin-button]:appearance-none
//                                     [&::-webkit-inner-spin-button]:appearance-none
//                                     [-moz-appearance:textfield]"
//                         id="scene-count"
//                         max={maxScenes}
//                         min={minScenes}
//                         type="number"
//                         value={sceneCount}
//                         onChange={handleSceneCountChange}
//                         />
//                     </div>

//                     <button
//                       aria-label="Increase scenes"
//                       className="w-10 h-10 rounded-lg flex items-center justify-center text-cyber-text hover:bg-cyber-surface hover:text-white transition-colors border border-transparent hover:border-cyber-border focus:outline-none focus:ring-2 focus:ring-cyber-accent disabled:opacity-40 disabled:cursor-not-allowed"
//                       type="button"
//                       onClick={handleIncrease}
//                       disabled={sceneCount >= maxScenes}
//                     >
//                       <svg
//                         className="w-5 h-5"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                         aria-hidden="true"
//                       >
//                         <path
//                           d="M12 6v6m0 0v6m0-6h6m-6 0H6"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                         />
//                       </svg>
//                     </button>
//                   </div>

//                   <div className="mt-4 flex items-start gap-2 text-xs text-cyber-text">
//                     <svg
//                       className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       aria-hidden="true"
//                     >
//                       <path
//                         d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                       />
//                     </svg>

//                     <p>
//                       Đề xuất: 3 scene cho nội dung video ngắn TikTok, Reels, Shorts.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </section>

//             {/* Right Column: Dynamic Brief Inputs */}
//             <section className="lg:w-2/3 flex flex-col">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-lg font-medium text-cyber-textStrong flex items-center gap-2">
//                   <svg
//                     className="w-5 h-5 text-cyber-text"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                     aria-hidden="true"
//                   >
//                     <path
//                       d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                     />
//                   </svg>
//                   Brief cho từng scene
//                 </h2>

//                 <span className="text-xs font-medium text-cyber-accent bg-cyber-accent/10 px-2 py-1 rounded-md border border-cyber-accent/20">
//                   {sceneCount} Active {sceneCount === 1 ? "Scene" : "Scenes"}
//                 </span>
//               </div>

//               <div className="space-y-6">
//                 {Array.from({ length: sceneCount }).map((_, index) => (
//                   <div
//                     key={index}
//                     className="cyber-glass rounded-xl overflow-hidden flex flex-col focus-within:ring-1 focus-within:ring-cyber-accent focus-within:border-cyber-accent transition-shadow"
//                   >
//                     <div className="bg-cyber-surface/50 px-4 py-2 border-b border-cyber-border flex justify-between items-center">
//                       <label
//                         className="text-sm font-semibold text-cyber-textStrong"
//                         htmlFor={`scene-${index + 1}-brief`}
//                       >
//                         Scene {index + 1}
//                       </label>

//                       <span className="text-xs text-cyber-text">
//                         {(briefs[index] || "").length}/{maxChars}
//                       </span>
//                     </div>

//                     {/* <textarea
//                       className="w-full bg-transparent border-none text-sm text-cyber-textStrong placeholder-cyber-text/50 p-4 focus:ring-0 resize-none"
//                       id={`scene-${index + 1}-brief`}
//                       placeholder={getPlaceholder(index)}
//                       rows="4"
//                       maxLength={maxChars}
//                       value={briefs[index] || ""}
//                       onChange={(event) =>
//                         handleBriefChange(index, event.target.value)
//                       }
//                     /> */}
//                     <textarea
//                     className="w-full bg-transparent border-none text-sm text-cyber-textStrong placeholder-cyber-text/50 p-4 focus:ring-0 resize-none overflow-y-auto scrollbar-hide"
//                     id={`scene-${index + 1}-brief`}
//                     placeholder={getPlaceholder(index)}
//                     rows="4"
//                     maxLength={maxChars}
//                     value={briefs[index] || ""}
//                     onChange={(event) =>
//                         handleBriefChange(index, event.target.value)
//                     }
//                     />
//                   </div>
//                 ))}
//               </div>
//             </section>
//           </div>
//         </div>
//       </div>

//       <div className="pt-8 border-t border-white/5 flex justify-between items-center">
//         <button
//           onClick={onBack}
//           type="button"
//           className="flex items-center gap-2 font-label-caps text-on-surface-variant hover:text-white transition-colors"
//         >
//           <span className="material-symbols-outlined">arrow_back</span>
//           Back
//         </button>

//         <button
//           onClick={handleNext}
//           type="button"
//           className="primary-gradient px-12 py-4 rounded-full font-label-caps text-white flex items-center gap-2 active:scale-95"
//         >
//           Next Step
//           <span className="material-symbols-outlined">arrow_forward</span>
//         </button>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";

export default function SceneAndBrief({ onNext, onBack }) {
  const [sceneCount, setSceneCount] = useState(3);
  const [briefs, setBriefs] = useState(["", "", ""]);
  const [selectedModel, setSelectedModel] = useState("chatgpt-5.2");

  const maxScenes = 10;
  const minScenes = 1;
  const maxChars = 500;

  const modelOptions = [
    { label: "ChatGPT 5.2", value: "chatgpt-5.2" },
    { label: "ChatGPT 5.3", value: "chatgpt-5.3" },
    { label: "Gemini 2.5", value: "gemini-2.5" },
    { label: "Gemini 3.0", value: "gemini-3.0" },
    { label: "Gemini 3.1", value: "gemini-3.1" },
  ];

  const handleDecrease = () => {
    setSceneCount((prev) => Math.max(minScenes, prev - 1));
  };

  const handleIncrease = () => {
    setSceneCount((prev) => {
      const next = Math.min(maxScenes, prev + 1);

      setBriefs((current) => {
        const updated = [...current];
        while (updated.length < next) updated.push("");
        return updated;
      });

      return next;
    });
  };

  const handleSceneCountChange = (event) => {
    let value = Number(event.target.value);

    if (Number.isNaN(value)) value = minScenes;

    value = Math.max(minScenes, Math.min(maxScenes, value));

    setSceneCount(value);

    setBriefs((current) => {
      const updated = [...current];

      while (updated.length < value) updated.push("");

      return updated.slice(0, value);
    });
  };

  const handleBriefChange = (index, value) => {
    const limitedValue = value.slice(0, maxChars);

    setBriefs((current) => {
      const updated = [...current];
      updated[index] = limitedValue;
      return updated;
    });
  };

  const getPlaceholder = () => {
    return "Để brief chất lượng thì bạn nên mô tả bối cảnh và trạng thái ban đầu của nhân vật (ở đâu hoặc làm gì), sau đó bạn mới mô tả hành động của nhân vật. Ví dụ: 'Background kệ sản phẩm có 4 tầng, tầng 1:súp thưởng Silver Spoon,... . Lúc này chưa có con mèo . Sau 1s Mèo ragdoll đi bằng 2 chân mang tạp dề màu xanh, kéo thùng đồ có logo Silver Spoon từ ngoài khung hình vào gần kệ tủ'";
  };

  const handleNext = () => {
    if (typeof onNext === "function") {
      onNext({
        sceneCount,
        briefs: briefs.slice(0, sceneCount),
        selectedModel,
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="glass-panel py-6 rounded-xl flex flex-row items-center justify-center gap-4 min-h-64">
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-24 scroll-smooth">
          <div className="max-w-6xl mx-auto h-full flex flex-col lg:flex-row gap-8 lg:gap-12 pt-6">
            {/* Left Column: Instructions & Configuration */}
            <section className="lg:w-1/3 flex flex-col gap-8">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-cyber-textStrong tracking-tight">
                  Scene &amp; Brief
                </h1>

                <p className="text-cyber-text text-base leading-relaxed">
                  Xác định cấu trúc cho dự án video của bạn.
                  Đặt tổng số cảnh và cung cấp ý tưởng cụ thể cho từng phân cảnh để tôi định hướng quá trình tạo nội dung.
                </p>
              </div>

              {/* Scene Counter Control */}
              <div className="cyber-glass rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute -inset-px bg-gradient-to-r from-cyber-accent to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-500 blur-sm" />

                <div className="relative z-10">
                  <label
                    className="text-sm font-medium text-cyber-textStrong mb-4 flex items-center"
                    htmlFor="scene-count"
                  >
                    <svg
                      className="w-5 h-5 mr-2 text-cyber-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                    Số luợng scene
                  </label>

                  <div className="flex items-center justify-between bg-cyber-bg border border-cyber-border rounded-xl p-2">
                    <button
                      aria-label="Decrease scenes"
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-cyber-text hover:bg-cyber-surface hover:text-white transition-colors border border-transparent hover:border-cyber-border focus:outline-none focus:ring-2 focus:ring-cyber-accent disabled:opacity-40 disabled:cursor-not-allowed"
                      type="button"
                      onClick={handleDecrease}
                      disabled={sceneCount <= minScenes}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M20 12H4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>

                    <div className="flex-1 flex justify-center">
                      <input
                        className="w-16 bg-transparent border-none text-center text-2xl font-bold
                                    text-cyber-textStrong focus:ring-0 p-0 m-0
                                    appearance-none
                                    [&::-webkit-outer-spin-button]:appearance-none
                                    [&::-webkit-inner-spin-button]:appearance-none
                                    [-moz-appearance:textfield]"
                        id="scene-count"
                        max={maxScenes}
                        min={minScenes}
                        type="number"
                        value={sceneCount}
                        onChange={handleSceneCountChange}
                      />
                    </div>

                    <button
                      aria-label="Increase scenes"
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-cyber-text hover:bg-cyber-surface hover:text-white transition-colors border border-transparent hover:border-cyber-border focus:outline-none focus:ring-2 focus:ring-cyber-accent disabled:opacity-40 disabled:cursor-not-allowed"
                      type="button"
                      onClick={handleIncrease}
                      disabled={sceneCount >= maxScenes}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-4 flex items-start gap-2 text-xs text-cyber-text">
                    <svg
                      className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>

                    <p>
                      Đề xuất: 3 scene cho nội dung video ngắn TikTok, Reels, Shorts.
                    </p>
                  </div>

                  {/* Model Combo Box */}
                  {/* <div className="mt-5">
                    <label
                      className="text-sm font-medium text-cyber-textStrong mb-4 flex items-center"
                      htmlFor="model-select"
                    >
                      <svg
                        className="w-5 h-5 mr-2 text-cyber-accent"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        >
                        <path
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                        />
                        </svg>
                      Chọn model AI để tạo prompt
                    </label>

                    <div className="relative">
                      <select
                        id="model-select"
                        value={selectedModel}
                        onChange={(event) => setSelectedModel(event.target.value)}
                        className="w-full appearance-none bg-cyber-bg border border-cyber-border rounded-xl px-4 py-3 pr-10 text-sm text-cyber-textStrong focus:outline-none focus:ring-2 focus:ring-cyber-accent cursor-pointer"
                      >
                        {modelOptions.map((model) => (
                          <option
                            key={model.value}
                            value={model.value}
                            className="bg-cyber-bg text-cyber-textStrong"
                          >
                            {model.label}
                          </option>
                        ))}
                      </select>

                      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cyber-text text-[20px]">
                        expand_more
                      </span>
                    </div>
                  </div> */}
                  {/* Model Combo Box */}
                    <div className="mt-5">
                        <label
                            className="text-sm font-medium text-cyber-textStrong mb-4 flex items-center"
                            htmlFor="model-select"
                        >
                            <svg
                            className="w-5 h-5 mr-2 text-cyber-accent"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            >
                            <path
                                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                            />
                            </svg>
                            Chọn model AI để tạo prompt
                        </label>

                        <div className="relative">
                            <select
                            id="model-select"
                            value={selectedModel}
                            onChange={(event) => setSelectedModel(event.target.value)}
                            className="w-full appearance-none rounded-xl px-4 py-3 pr-10 text-sm
                                        bg-slate-900 text-white border border-cyber-border
                                        focus:outline-none focus:ring-2 focus:ring-cyber-accent
                                        focus:border-cyber-accent cursor-pointer"
                            >
                            {modelOptions.map((model) => (
                                <option
                                    key={model.value}
                                    value={model.value}
                                    className="bg-slate-900 text-white"
                                    >
                                    {model.label}
                                    </option>
                                ))}
                            </select>

                            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white text-[20px]">
                            expand_more
                            </span>
                        </div>
                    </div>
                </div>
              </div>
            </section>

            {/* Right Column: Dynamic Brief Inputs */}
            <section className="lg:w-2/3 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-cyber-textStrong flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-cyber-text"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  Brief cho từng scene
                </h2>

                <span className="text-xs font-medium text-cyber-accent bg-cyber-accent/10 px-2 py-1 rounded-md border border-cyber-accent/20">
                  {sceneCount} Active {sceneCount === 1 ? "Scene" : "Scenes"}
                </span>
              </div>

              <div className="space-y-6">
                {Array.from({ length: sceneCount }).map((_, index) => (
                  <div
                    key={index}
                    className="cyber-glass rounded-xl overflow-hidden flex flex-col focus-within:ring-1 focus-within:ring-cyber-accent focus-within:border-cyber-accent transition-shadow"
                  >
                    <div className="bg-cyber-surface/50 px-4 py-2 border-b border-cyber-border flex justify-between items-center">
                      <label
                        className="text-sm font-semibold text-cyber-textStrong"
                        htmlFor={`scene-${index + 1}-brief`}
                      >
                        Scene {index + 1}
                      </label>

                      <span className="text-xs text-cyber-text">
                        {(briefs[index] || "").length}/{maxChars}
                      </span>
                    </div>

                    <textarea
                      className="w-full bg-transparent border-none text-sm text-cyber-textStrong placeholder-cyber-text/50 p-4 focus:ring-0 resize-none overflow-y-auto scrollbar-hide"
                      id={`scene-${index + 1}-brief`}
                      placeholder={getPlaceholder(index)}
                      rows="4"
                      maxLength={maxChars}
                      value={briefs[index] || ""}
                      onChange={(event) =>
                        handleBriefChange(index, event.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 flex justify-between items-center">
        <button
          onClick={onBack}
          type="button"
          className="flex items-center gap-2 font-label-caps text-on-surface-variant hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>

        <button
          onClick={handleNext}
          type="button"
          className="primary-gradient px-12 py-4 rounded-full font-label-caps text-white flex items-center gap-2 active:scale-95"
        >
          Next Step
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}