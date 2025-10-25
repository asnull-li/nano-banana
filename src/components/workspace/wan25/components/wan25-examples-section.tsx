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

interface Wan25ExamplesSectionProps {
  pageData: any;
}

export default function Wan25ExamplesSection({
  pageData,
}: Wan25ExamplesSectionProps) {
  // 从 pageData 中提取数据
  const title = pageData?.examples?.title || "Wan 2.5 Creative Examples";
  const subtitle =
    pageData?.examples?.subtitle ||
    "Explore the powerful video generation capabilities of Wan 2.5, from images to videos, from text to animations";

  // 示例数据配置
  const examples: ExampleData[] = [
    {
      id: "image-to-video-1",
      type: "image-to-video",
      title: pageData?.examples?.image_to_video?.title || "Image to Video",
      description:
        pageData?.examples?.image_to_video?.description ||
        "Upload a static image and Wan 2.5 will bring it to life with smooth, natural motion",
      input: {
        type: "image",
        content:
          pageData?.examples?.image_to_video?.input_image_url ||
          "https://file.nanobanana.org/showcase/wan25/example-image.jpg",
        alt:
          pageData?.examples?.image_to_video?.input_image_alt ||
          "Example image for Wan 2.5",
      },
      output: {
        videoUrl:
          pageData?.examples?.image_to_video?.output_video_url ||
          "https://file.nanobanana.org/showcase/wan25/example-video.mp4",
      },
    },
    {
      id: "text-to-video-1",
      type: "text-to-video",
      title: pageData?.examples?.text_to_video?.title || "Text to Video",
      description:
        pageData?.examples?.text_to_video?.description ||
        "With just text descriptions, Wan 2.5 can understand your creative vision and generate professional videos",
      input: {
        type: "text",
        content:
          pageData?.examples?.text_to_video?.input_prompt ||
          "A serene sunset over a calm ocean, with waves gently rolling onto a sandy beach. The sky is painted in vibrant oranges and purples, creating a peaceful atmosphere.",
      },
      output: {
        videoUrl:
          pageData?.examples?.text_to_video?.output_video_url ||
          "https://file.nanobanana.org/showcase/wan25/text-example.mp4",
      },
    },
  ];

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden bg-gradient-to-b from-slate-50/50 to-white dark:from-zinc-900/30 dark:to-zinc-950/30">
      {/* 背景装饰 - 更简约的渐变 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-slate-200/30 to-slate-100/20 dark:from-slate-800/20 dark:to-slate-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-gradient-to-tl from-zinc-200/30 to-zinc-100/20 dark:from-zinc-800/20 dark:to-zinc-900/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题区域 */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm mb-4">
            <Sparkles className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Creative Examples
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* 示例网格 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {examples.map((example) => (
            <div
              key={example.id}
              className="group relative bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-lg"
            >
              <div className="p-6 space-y-5">
                {/* 标题和描述 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {example.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {example.description}
                  </p>
                </div>

                {/* 输入展示 */}
                <div className="rounded-lg bg-slate-50 dark:bg-zinc-800/80 p-4 border border-slate-100 dark:border-zinc-700/50">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                    Input
                  </p>
                  {example.input.type === "image" ? (
                    <img
                      src={example.input.content}
                      alt={example.input.alt}
                      className="w-full rounded-md border border-slate-200 dark:border-zinc-700"
                    />
                  ) : (
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      &ldquo;{example.input.content}&rdquo;
                    </p>
                  )}
                </div>

                {/* 输出视频 */}
                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 bg-black">
                  <video
                    src={example.output.videoUrl}
                    controls
                    loop
                    muted
                    playsInline
                    className="w-full aspect-video"
                    poster={example.output.thumbnail}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
