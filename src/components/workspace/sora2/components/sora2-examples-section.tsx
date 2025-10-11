import { Sparkles } from "lucide-react";

interface ExampleData {
  id: string;
  type: "image-to-video" | "text-to-video";
  title: string;
  description: string;
  input: {
    type: "image" | "text";
    content: string;
    alt?: string;
  };
  output: {
    videoUrl: string;
    thumbnail?: string;
  };
}

interface Sora2ExamplesSectionProps {
  pageData: any;
}

export default function Sora2ExamplesSection({
  pageData,
}: Sora2ExamplesSectionProps) {
  // 从 pageData 中提取数据
  const title = pageData?.examples?.title || "Sora 2 Creative Examples";
  const subtitle =
    pageData?.examples?.subtitle ||
    "Explore the powerful video generation capabilities of Sora 2, from images to videos, from text to animations";

  // 示例数据配置
  const examples: ExampleData[] = [
    {
      id: "image-to-video-1",
      type: "image-to-video",
      title: pageData?.examples?.image_to_video?.title || "Image to Video",
      description:
        pageData?.examples?.image_to_video?.description ||
        "Upload a static image and Sora 2 will bring it to life with smooth, natural motion",
      input: {
        type: "image",
        content:
          pageData?.examples?.image_to_video?.input_image_url ||
          "https://file.nanobanana.org/showcase/sora2/example-image.jpg",
        alt:
          pageData?.examples?.image_to_video?.input_image_alt ||
          "Example image for Sora 2",
      },
      output: {
        videoUrl:
          pageData?.examples?.image_to_video?.output_video_url ||
          "https://file.nanobanana.org/showcase/sora2/example-video.mp4",
      },
    },
    {
      id: "text-to-video-1",
      type: "text-to-video",
      title: pageData?.examples?.text_to_video?.title || "Text to Video",
      description:
        pageData?.examples?.text_to_video?.description ||
        "With just text descriptions, Sora 2 can understand your creative vision and generate professional videos",
      input: {
        type: "text",
        content:
          pageData?.examples?.text_to_video?.input_prompt ||
          "A serene sunset over a calm ocean, with waves gently rolling onto a sandy beach. The sky is painted in vibrant oranges and purples, creating a peaceful atmosphere.",
      },
      output: {
        videoUrl:
          pageData?.examples?.text_to_video?.output_video_url ||
          "https://file.nanobanana.org/showcase/sora2/text-example.mp4",
      },
    },
  ];

  return (
    <section className="relative py-15 lg:py-20 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-cyan-500/5 to-emerald-500/5 [.dark_&]:from-emerald-400/10 [.dark_&]:via-cyan-400/10 [.dark_&]:to-emerald-400/10" />

        {/* 浮动光点 */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-emerald-500/40 [.dark_&]:bg-emerald-400/60 rounded-full animate-ping" />
        <div className="absolute top-40 right-20 w-3 h-3 bg-cyan-500/40 [.dark_&]:bg-cyan-400/60 rounded-full animate-ping [animation-delay:1s]" />
        <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-emerald-500/40 [.dark_&]:bg-emerald-400/60 rounded-full animate-ping [animation-delay:2s]" />
      </div>

      <div className="container relative z-10">
        {/* 标题区域 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 [.dark_&]:from-emerald-400 [.dark_&]:to-cyan-400 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 [.dark_&]:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* 示例列表 */}
        <div className="space-y-16">
          {examples.map((example, index) => (
            <div
              key={example.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center ${
                index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
              } ${example.type === "image-to-video" ? "max-w-5xl mx-auto" : ""}`}
            >
              {/* 输入区域 */}
              <div
                className={`${
                  index % 2 === 1 ? "lg:col-start-2" : ""
                } space-y-4`}
              >
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 [.dark_&]:text-white">
                    {example.title}
                  </h3>
                  <p className="text-slate-600 [.dark_&]:text-slate-300 leading-relaxed">
                    {example.description}
                  </p>
                </div>

                {/* 输入内容卡片 */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 [.dark_&]:from-emerald-400/30 [.dark_&]:to-cyan-400/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-white/80 [.dark_&]:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 [.dark_&]:border-slate-700/60 rounded-2xl p-4 transition-all duration-300 group-hover:border-emerald-500/30 [.dark_&]:group-hover:border-emerald-400/50">
                    {example.input.type === "image" ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
                          <span className="text-sm font-medium text-slate-700 [.dark_&]:text-slate-300">
                            {pageData?.examples?.labels?.original_image ||
                              "Original Image"}
                          </span>
                        </div>
                        <div className="relative rounded-xl overflow-hidden max-w-sm mx-auto lg:max-w-none">
                          <img
                            src={example.input.content}
                            alt={example.input.alt || "Input image"}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
                          <span className="text-sm font-medium text-slate-700 [.dark_&]:text-slate-300">
                            {pageData?.examples?.labels?.prompt_text ||
                              "Prompt"}
                          </span>
                        </div>
                        <div className="bg-slate-50/50 [.dark_&]:bg-slate-900/50 rounded-xl p-4 border border-slate-200/30 [.dark_&]:border-slate-700/30">
                          <p className="text-sm md:text-base text-slate-700 [.dark_&]:text-slate-300 leading-relaxed font-mono">
                            "{example.input.content}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 输出视频区域 */}
              <div
                className={`${
                  index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""
                } space-y-4`}
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 [.dark_&]:from-emerald-400/30 [.dark_&]:to-cyan-400/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-white/80 [.dark_&]:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 [.dark_&]:border-slate-700/60 rounded-2xl p-4 transition-all duration-300 group-hover:border-emerald-500/30 [.dark_&]:group-hover:border-emerald-400/50">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full animate-pulse" />
                          <span className="text-sm font-medium text-slate-700 [.dark_&]:text-slate-300">
                            {pageData?.examples?.labels?.ai_generated_video ||
                              "AI Generated Video"}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Sora 2
                        </div>
                      </div>

                      <div className={`relative rounded-xl overflow-hidden bg-black ${
                        example.type === "image-to-video" ? "max-w-sm mx-auto lg:max-w-none" : ""
                      }`}>
                        <video
                          className="w-full h-auto"
                          poster={example.output.thumbnail}
                          controls
                          preload="metadata"
                        >
                          <source
                            src={example.output.videoUrl}
                            type="video/mp4"
                          />
                          {pageData?.examples?.labels?.browser_not_supported ||
                            "Your browser does not support video playback."}
                        </video>

                        {/* 视频信息标签 */}
                        <div className="absolute bottom-4 right-4">
                          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                            <div className="text-xs text-white/80">
                              {pageData?.examples?.labels?.video_info ||
                                "AI Generated"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
