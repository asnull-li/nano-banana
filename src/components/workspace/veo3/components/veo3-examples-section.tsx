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

interface Veo3ExamplesSectionProps {
  pageData: any;
}

export default function Veo3ExamplesSection({
  pageData,
}: Veo3ExamplesSectionProps) {
  // 从 pageData 中提取数据
  const title = pageData?.examples?.title || "Veo 3 创作示例";
  const subtitle =
    pageData?.examples?.subtitle ||
    "探索 Veo 3 强大的视频生成能力，从图片到视频，从文字到动画，体验 AI 视频创作的无限可能";

  // 示例数据配置
  const examples: ExampleData[] = [
    {
      id: "image-to-video-1",
      type: "image-to-video",
      title: pageData?.examples?.image_to_video?.title || "图片生成视频",
      description:
        pageData?.examples?.image_to_video?.description ||
        "上传一张静态图片，Veo 3 将为其注入生命力，创造出流畅自然的动态视频效果",
      input: {
        type: "image",
        content:
          pageData?.examples?.image_to_video?.input_image_url ||
          "https://file.nanobanana.org/showcase/veo3/woman-city-doodle.jpg",
        alt:
          pageData?.examples?.image_to_video?.input_image_alt ||
          "城市涂鸦风格女性插画",
      },
      output: {
        videoUrl:
          pageData?.examples?.image_to_video?.output_video_url ||
          "https://file.nanobanana.org/showcase/veo3/woman-city-doodle.mp4",
      },
    },
    {
      id: "text-to-video-1",
      type: "text-to-video",
      title: pageData?.examples?.text_to_video?.title || "文本生成视频",
      description:
        pageData?.examples?.text_to_video?.description ||
        "仅凭文字描述，Veo 3 就能理解您的创意愿景，生成令人惊叹的专业级视频内容",
      input: {
        type: "text",
        content:
          pageData?.examples?.text_to_video?.input_prompt ||
          "超高速追踪镜头穿越广阔的未来主义城市景观，高耸的建筑由反光的有机铬制成，在明亮的正午阳光下闪闪发光。彩虹光斑和水晶散景散布在画面中，相机在建筑物之间动态穿梭。",
      },
      output: {
        videoUrl:
          pageData?.examples?.text_to_video?.output_video_url ||
          "https://file.nanobanana.org/showcase/veo3/tmp7uoz8hjv.mp4",
      },
    },
  ];

  return (
    <section className="relative py-15 lg:py-20 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-cyan-500/5 to-green-500/5 [.dark_&]:from-green-400/10 [.dark_&]:via-cyan-400/10 [.dark_&]:to-green-400/10" />

        {/* 浮动光点 */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-green-500/40 [.dark_&]:bg-green-400/60 rounded-full animate-ping" />
        <div className="absolute top-40 right-20 w-3 h-3 bg-cyan-500/40 [.dark_&]:bg-cyan-400/60 rounded-full animate-ping [animation-delay:1s]" />
        <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-green-500/40 [.dark_&]:bg-green-400/60 rounded-full animate-ping [animation-delay:2s]" />
      </div>

      <div className="container relative z-10">
        {/* 标题区域 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-600 to-cyan-600 [.dark_&]:from-green-400 [.dark_&]:to-cyan-400 bg-clip-text text-transparent">
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
              }`}
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
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-cyan-500/20 [.dark_&]:from-green-400/30 [.dark_&]:to-cyan-400/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-white/80 [.dark_&]:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 [.dark_&]:border-slate-700/60 rounded-2xl p-4 transition-all duration-300 group-hover:border-green-500/30 [.dark_&]:group-hover:border-green-400/50">
                    {example.input.type === "image" ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full" />
                          <span className="text-sm font-medium text-slate-700 [.dark_&]:text-slate-300">
                            {pageData?.examples?.labels?.original_image ||
                              "原始图片"}
                          </span>
                        </div>
                        <div className="relative rounded-xl overflow-hidden">
                          <img
                            src={example.input.content}
                            alt={example.input.alt || "输入图片"}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full" />
                          <span className="text-sm font-medium text-slate-700 [.dark_&]:text-slate-300">
                            {pageData?.examples?.labels?.prompt_text ||
                              "提示词"}
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
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-cyan-500/20 [.dark_&]:from-green-400/30 [.dark_&]:to-cyan-400/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-white/80 [.dark_&]:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 [.dark_&]:border-slate-700/60 rounded-2xl p-4 transition-all duration-300 group-hover:border-green-500/30 [.dark_&]:group-hover:border-green-400/50">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full animate-pulse" />
                          <span className="text-sm font-medium text-slate-700 [.dark_&]:text-slate-300">
                            {pageData?.examples?.labels?.ai_generated_video ||
                              "AI 生成视频"}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-cyan-500 text-white">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Veo 3
                        </div>
                      </div>

                      <div className="relative rounded-xl overflow-hidden bg-black">
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
                            "您的浏览器不支持视频播放。"}
                        </video>

                        {/* 视频信息标签 */}
                        <div className="absolute bottom-4 right-4">
                          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                            <div className="text-xs text-white/80">
                              {pageData?.examples?.labels?.video_info ||
                                "8秒 • 720P"}
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
